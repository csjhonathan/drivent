import faker from '@faker-js/faker';
import { TicketStatus } from '@prisma/client';
import httpStatus from 'http-status';
import supertest from 'supertest';
import * as jwt from 'jsonwebtoken';
import { cleanDb, generateValidToken } from '../helpers';
import {
  createEnrollmentWithAddress,
  createHotelRooms,
  createHotelsWithRooms,
  createTicket,
  createTicketTypeWithHotel,
  createUser,
} from '../factories';
import { createBooking } from '../factories/booking-factory';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('GET /booking', () => {
  describe('when token is invalid', () => {
    it('Should respond with status 401 when sending invalid token', async () => {
      const token = faker.word.adjective();

      const { statusCode } = await server.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(httpStatus.UNAUTHORIZED).toBe(statusCode);
    });

    it('Should respond with status 401 when not sending a token', async () => {
      const { statusCode } = await server.get('/booking');

      expect(httpStatus.UNAUTHORIZED).toBe(statusCode);
    });

    it('should respond with status 401 if there is no session for given token', async () => {
      const userWithoutSession = await createUser();
      const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

      const response = await server.get('/enrollments').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  });

  describe('when token is valid', () => {
    it('Should it return 200 status and reservation information on success', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotelsWithRooms();
      const room = await createHotelRooms(hotel.id);
      const booking = await createBooking(room.id, user.id);

      const { statusCode, body } = await server.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(statusCode).toBe(httpStatus.OK);
      expect(body).toEqual({
        id: booking.id,
        Room: {
          id: room.id,
          name: room.name,
          hotelId: room.hotelId,
          capacity: room.capacity,
          createdAt: room.createdAt.toISOString(),
          updatedAt: room.updatedAt.toISOString(),
        },
      });
    });
  });
});

describe('POST /booking', () => {
  describe('when token is invalid', () => {
    it('Should respond with status 401 when sending invalid token', async () => {
      const token = faker.word.adjective();

      const { statusCode } = await server.post('/booking').set('Authorization', `Bearer ${token}`);

      expect(httpStatus.UNAUTHORIZED).toBe(statusCode);
    });

    it('Should respond with status 401 when not sending a token', async () => {
      const { statusCode } = await server.post('/booking');

      expect(httpStatus.UNAUTHORIZED).toBe(statusCode);
    });

    it('should respond with status 401 if there is no session for given token', async () => {
      const userWithoutSession = await createUser();
      const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

      const response = await server.post('/enrollments').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  });

  describe('when token is valid', () => {
    it('Should return status 200 and booking id on success', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotelsWithRooms();
      const room = await createHotelRooms(hotel.id);

      const { statusCode, body } = await server
        .post('/booking')
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: room.id });

      expect(statusCode).toBe(httpStatus.OK);
      expect(body).toEqual({ bookingId: expect.any(Number) });
    });

    it('should Return status 403 if room has no vacancies', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotelsWithRooms();
      const room = await createHotelRooms(hotel.id, 0);

      const { statusCode } = await server
        .post('/booking')
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: room.id });

      expect(statusCode).toBe(httpStatus.FORBIDDEN);
    });
  });
});

describe('PUT /booking', () => {
  describe('when token is invalid', () => {
    it('Should respond with status 401 when sending invalid token', async () => {
      const token = faker.word.adjective();

      const { statusCode } = await server.post('/booking').set('Authorization', `Bearer ${token}`);

      expect(httpStatus.UNAUTHORIZED).toBe(statusCode);
    });

    it('Should respond with status 401 when not sending a token', async () => {
      const { statusCode } = await server.post('/booking');

      expect(httpStatus.UNAUTHORIZED).toBe(statusCode);
    });

    it('should respond with status 401 if there is no session for given token', async () => {
      const userWithoutSession = await createUser();
      const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

      const response = await server.post('/enrollments').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  });

  describe('when token is valid', () => {
    it('Should return status 200 and booking id on success', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotelsWithRooms();
      const room = await createHotelRooms(hotel.id);
      const booking = await createBooking(room.id, user.id);
      const newRoom = await createHotelRooms(hotel.id);

      const { statusCode, body } = await server
        .put(`/booking/${booking.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: newRoom.id });

      expect(statusCode).toBe(httpStatus.OK);
      expect(body).toEqual({ bookingId: expect.any(Number) });
    });

    it('should Return status 403 if room has no vacancies', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotelsWithRooms();
      const room = await createHotelRooms(hotel.id);
      const booking = await createBooking(room.id, user.id);
      const newRoom = await createHotelRooms(hotel.id, 0);

      const { statusCode } = await server
        .put(`/booking/${booking.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: newRoom.id });

      expect(statusCode).toBe(httpStatus.FORBIDDEN);
    });

    it('should return status 403 if user has no reservation', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotelsWithRooms();
      const newRoom = await createHotelRooms(hotel.id, 0);

      const { statusCode } = await server
        .put(`/booking/${+Infinity}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ roomId: newRoom.id });

      expect(statusCode).toBe(httpStatus.FORBIDDEN);
    });
  });
});
