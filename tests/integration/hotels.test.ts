import faker from '@faker-js/faker';
import { TicketStatus } from '@prisma/client';
import httpStatus from 'http-status';
import supertest from 'supertest';
import { cleanDb, generateValidToken } from '../helpers';
import {
  createEnrollmentWithAddress,
  createHotelsWithRooms,
  createTicket,
  createTicketTypeRemote,
  createTicketTypeWithHotel,
  createTicketTypeWithoutHotel,
  createUser,
} from '../factories';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('GET /hotels', () => {
  it('Should respond with status 401 when sending invalid token', async () => {
    const token = faker.word.adjective();

    const { statusCode } = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(httpStatus.UNAUTHORIZED).toBe(statusCode);
  });

  it('Should respond with status 401 when not sending a token', async () => {
    const { statusCode } = await server.get('/hotels');

    expect(httpStatus.UNAUTHORIZED).toBe(statusCode);
  });

  describe('when token is valid', () => {
    it('should respond with status 404 when user doesnt have an enrollment yet', async () => {
      const token = await generateValidToken();

      const { statusCode } = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(statusCode).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with status 404 when user doesnt have a ticket yet', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);

      const { statusCode } = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(statusCode).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with status 404 when no hotels exist ', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const { statusCode } = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(statusCode).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with status 402 if ticket was not paid ', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      const { statusCode } = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(statusCode).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with status 402 if ticket type is remote', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeRemote();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      const { statusCode } = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(statusCode).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with status 402 if the ticket type does not include hotel', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithoutHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      const { statusCode } = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(statusCode).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with status the list of hotels available on success', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createHotelsWithRooms();
      const { statusCode, body } = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(statusCode).toEqual(httpStatus.OK);
      expect(body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            name: expect.any(String),
            image: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          }),
        ]),
      );
    });
  });
});

describe('GET /hotels/:id', () => {
  it('Should respond with status 401 when sending invalid token', async () => {
    const token = faker.word.adjective();
    const id = faker.datatype.number({ min: 1, max: 10 });
    const { statusCode } = await server.get(`/hotels/${id}`).set('Authorization', `Bearer ${token}`);

    expect(httpStatus.UNAUTHORIZED).toBe(statusCode);
  });

  it('Should respond with status 401 when not sending a token', async () => {
    const id = faker.datatype.number({ min: 1, max: 10 });
    const { statusCode } = await server.get(`/hotels/${id}`);

    expect(httpStatus.UNAUTHORIZED).toBe(statusCode);
  });

  describe('when token is valid', () => {
    it('should respond with status 404 when user doesnt have an enrollment yet', async () => {
      const token = await generateValidToken();
      const id = faker.datatype.number({ min: 1, max: 10 });
      const { statusCode } = await server.get(`/hotels/${id}`).set('Authorization', `Bearer ${token}`);

      expect(statusCode).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with status 404 when user doesnt have a ticket yet', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);
      const id = faker.datatype.number({ min: 1, max: 10 });
      const { statusCode } = await server.get(`/hotels/${id}`).set('Authorization', `Bearer ${token}`);

      expect(statusCode).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with status 404 when no hotel exists ', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotelsWithRooms();
      const { statusCode } = await server.get(`/hotels/${hotel.id + 1}`).set('Authorization', `Bearer ${token}`);

      expect(statusCode).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with status 402 if ticket was not paid ', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      const hotel = await createHotelsWithRooms();
      const { statusCode } = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);

      expect(statusCode).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with status 402 if ticket type is remote', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeRemote();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      const hotel = await createHotelsWithRooms();
      const { statusCode } = await server.get(`/hotels/${hotel.id + 1}`).set('Authorization', `Bearer ${token}`);

      expect(statusCode).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with status 402 if the ticket type does not include hotel', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithoutHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      const hotel = await createHotelsWithRooms();
      const { statusCode } = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);

      expect(statusCode).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with the hotel with empty array if hotel have no rooms', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotelsWithRooms();
      const { statusCode, body } = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);

      expect(statusCode).toEqual(httpStatus.OK);
    });
  });
});
