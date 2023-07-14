import { prisma } from '@/config';

async function getAllHotels() {
  return await prisma.hotel.findMany();
}

async function getHotelWithRoomsById(id: number) {
  const hotelWithRooms = await prisma.hotel.findFirst({
    where: {
      id,
    },
    include: {
      Rooms: true,
    },
  });

  return hotelWithRooms;
}
const hotelsRepository = {
  getAllHotels,
  getHotelWithRoomsById,
};

export default hotelsRepository;
