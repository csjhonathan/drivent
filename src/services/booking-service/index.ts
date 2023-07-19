import { notFoundError } from '@/errors';
import bookingRepository from '@/repositories/booking-repository';

async function findBookingByUserId(userId: number) {
  const booking = await bookingRepository.findBookingByUserId(userId);

  if (!booking) throw notFoundError();

  return booking;
}

const bookingService = {
  findBookingByUserId,
};

export default bookingService;
