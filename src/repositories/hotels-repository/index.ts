import { prisma } from '@/config';

async function getAllHotels() {
  return await prisma.hotel.findMany();
}

const hotelsRepository = {
  getAllHotels,
};

export default hotelsRepository;
