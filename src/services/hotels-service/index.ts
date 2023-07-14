import enrollmentsService from '../enrollments-service';
import ticketService from '../tickets-service';
import { notFoundError } from '@/errors';
import { paymentRequired } from '@/errors/payment-required-error';
import hotelsRepository from '@/repositories/hotels-repository';
import ticketsRepository from '@/repositories/tickets-repository';

async function getAllHotels(userId: number) {
  const enrollment = await enrollmentsService.getUserEnrollment(userId);
  if (!enrollment) throw notFoundError();

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket) throw notFoundError();

  const { isRemote, includesHotel } = ticket.TicketType;
  const notPaid = ticket.status === 'RESERVED';
  if (!includesHotel || isRemote || notPaid) throw paymentRequired();

  const hotels = await hotelsRepository.getAllHotels();
  if (!hotels || !hotels.length) throw notFoundError();

  return hotels;
}

const hotelsService = {
  getAllHotels,
};

export default hotelsService;
