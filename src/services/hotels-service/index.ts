import enrollmentsService from '../enrollments-service';
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

async function getHotelWithRoomsById(userId: number, hotelId: number) {
  await getAllHotels(userId);

  const hotelWithRooms = await hotelsRepository.getHotelWithRoomsById(hotelId);
  if (!hotelWithRooms) throw notFoundError();
  const { id, name, image, createdAt, updatedAt, Rooms } = hotelWithRooms;
  return {
    id,
    name,
    image,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
    Rooms:
      Rooms.length > 0
        ? [
            {
              id: Rooms[0].id,
              name: Rooms[0].name,
              capacity: Rooms[0].capacity,
              hotelId: Rooms[0].hotelId,
              createdAt: Rooms[0].createdAt.toISOString(),
              updatedAt: Rooms[0].updatedAt.toISOString(),
            },
          ]
        : [],
  };
}
const hotelsService = {
  getAllHotels,
  getHotelWithRoomsById,
};

export default hotelsService;
