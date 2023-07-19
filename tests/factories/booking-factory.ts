import faker from '@faker-js/faker';
import { prisma } from '@/config';

export async function createBooking(roomId: number, userId: number) {
  return await prisma.booking.create({
    data: {
      roomId,
      createdAt: faker.date.recent(),
      updatedAt: faker.date.future(),
      userId,
    },
  });
}

export async function updateBooking(roomId: number, id: number) {
  return await prisma.booking.update({
    data: {
      roomId,
      updatedAt: faker.date.future(),
    },
    where: {
      id,
    },
  });
}
