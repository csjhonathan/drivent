import { prisma } from '@/config';

async function findBookingByUserId(userId: number) {
  return await prisma.booking.findFirst({
    select: {
      id: true,
      Room: true,
    },
    where: {
      userId,
    },
  });
}

async function createBooking(roomId: number, userId: number) {
  return await prisma.booking.create({
    data: {
      roomId,
      userId,
    },
  });
}

const bookingRepository = {
  findBookingByUserId,
  createBooking,
};

export default bookingRepository;
