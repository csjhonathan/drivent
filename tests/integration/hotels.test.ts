import faker from '@faker-js/faker';
import { TicketStatus } from '@prisma/client';
import httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
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
import { prisma } from '@/config';
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

      const response = await server.get('/tickets').set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it('should respond with status 404 when user doesnt have a ticket yet', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);

      const response = await server.get('/tickets').set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
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

    it('should respond with status 404 if there are no hotels', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const { statusCode } = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

      expect(statusCode).toEqual(httpStatus.NOT_FOUND);
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
