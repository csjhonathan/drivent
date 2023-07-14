import faker from '@faker-js/faker';
import { prisma } from '@/config';

export async function createHotelsWithRooms() {
  const hotel = await prisma.hotel.create({
    data: {
      name: faker.commerce.department(),
      image: faker.image.imageUrl(),
      createdAt: faker.date.recent(),
      updatedAt: faker.date.future(),
    },
    include: {
      Rooms: true,
    },
  });
  return hotel;
}
