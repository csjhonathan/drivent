import faker from '@faker-js/faker';
import { prisma } from '@/config';

export async function createHotelRooms(hotelId: number, capacity?: number) {
  return await prisma.room.create({
    data: {
      hotelId,
      capacity: capacity ?? faker.datatype.number({ min: 2 }),
      name: faker.commerce.department(),
      createdAt: faker.date.recent(),
      updatedAt: faker.date.future(),
    },
  });
}

export async function updateRoomCapacity(id: number, entry: boolean) {
  return await prisma.room.update({
    data: {
      capacity: entry ? { decrement: 1 } : { increment: 1 },
    },
    where: {
      id,
    },
  });
}
