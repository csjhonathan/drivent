import { notFoundError } from '@/errors';
import { forbiddenError } from '@/errors/forbidden-error';
import bookingRepository from '@/repositories/booking-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';
import roomsRepository from '@/repositories/rooms-repository';
import ticketsRepository from '@/repositories/tickets-repository';

async function findBookingByUserId(userId: number) {
  const booking = await bookingRepository.findBookingByUserId(userId);

  if (!booking) throw notFoundError();

  return booking;
}
async function createBooking(roomId: number, userId: number) {
  await validateBooking(roomId, userId);
  return await bookingRepository.createBooking(roomId, userId);
}

async function validateBooking(roomId: number, userId: number) {
  const room = await roomsRepository.findRoomById(roomId);

  if (!room) throw notFoundError();
  if (room.capacity < 1) throw forbiddenError();

  const enrollment = await enrollmentRepository.getUserEnrollment(userId);
  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);

  if (ticket.TicketType.isRemote || !ticket.TicketType.includesHotel || ticket.status !== 'PAID') {
    throw forbiddenError();
  }
}

async function updateBooking(roomId: number, userId: number, bookingId: number) {
  const booking = await bookingRepository.findBookingByUserId(userId);

  if (!booking) throw forbiddenError();
  await validateBooking(roomId, userId);

  return await bookingRepository.updateBooking(roomId, bookingId);
}
const bookingService = {
  findBookingByUserId,
  createBooking,
  updateBooking,
};

export default bookingService;
