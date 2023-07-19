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

const bookingRepository = {
  findBookingByUserId,
};

export default bookingRepository;
