import { prisma } from '@/config';

async function getAllHotels() {
  return await prisma.hotel.findMany();
}

async function getHotelWithRoomsById(id: number) {
  return await prisma.hotel.findUnique({
    where: {
      id,
    },
    include: {
      Rooms: true,
    },
  });
}
const hotelsRepository = {
  getAllHotels,
  getHotelWithRoomsById,
};

export default hotelsRepository;
