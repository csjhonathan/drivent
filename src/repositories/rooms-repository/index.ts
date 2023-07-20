import { prisma } from '@/config';

async function findRoomById(id: number) {
  return await prisma.room.findFirst({
    where: {
      id,
    },
  });
}

const roomsRepository = {
  findRoomById,
};

export default roomsRepository;
