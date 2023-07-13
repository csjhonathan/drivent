import enrollmentsService from '../enrollments-service';
import ticketService from '../tickets-service';
import { notFoundError } from '@/errors';
import { paymentRequired } from '@/errors/payment-required-error';
import hotelsRepository from '@/repositories/hotels-repository';
import ticketsRepository from '@/repositories/tickets-repository';

async function getAllHotels(userId: number) {
  const enrollment = await enrollmentsService.getUserEnrollment(userId);
  const ticket = await ticketService.getTicketByUserId(userId);
  const hotels = await hotelsRepository.getAllHotels();

  if (!ticket || !enrollment || !hotels || !hotels.length) throw notFoundError();

  const ticketWithType = await ticketsRepository.findTickeWithTypeById(ticket.id);
  const { includesHotel, isRemote } = ticketWithType.TicketType;

  if (!includesHotel || isRemote || ticket.status !== 'PAID') throw paymentRequired();

  return hotels;
}

const hotelsService = {
  getAllHotels,
};

export default hotelsService;
