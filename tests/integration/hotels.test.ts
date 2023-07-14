import faker from '@faker-js/faker';
import { TicketStatus } from '@prisma/client';
import httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import supertest from 'supertest';
import { cleanDb, generateValidToken } from '../helpers';
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
  it('Should it return status 401 when sending invalid token', async () => {
    const token = faker.word.adjective();

    const { statusCode } = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(httpStatus.UNAUTHORIZED).toBe(statusCode);
  });

  it('Should return status 401 when not sending a token', async () => {
    const { statusCode } = await server.get('/hotels');

    expect(httpStatus.UNAUTHORIZED).toBe(statusCode);
  });
});
