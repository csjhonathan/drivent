import { prisma } from '@/config';

async function findRoomById(id: number) {
  return await prisma.room.findFirst({
    where: {
      id,
    },
  });
}

async function updateRoomCapacity(id: number, entry: boolean) {
  return await prisma.room.update({
    data: {
      capacity: entry ? { decrement: 1 } : { increment: 1 },
    },
    where: {
      id,
    },
  });
}

const roomsRepository = {
  findRoomById,
  updateRoomCapacity,
};

export default roomsRepository;
