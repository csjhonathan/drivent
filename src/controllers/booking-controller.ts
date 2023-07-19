import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import bookingService from '@/services/booking-service';
import { InputBookingBody } from '@/protocols';

export async function getBookingByUserId(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const booking = await bookingService.findBookingByUserId(userId);
  res.status(httpStatus.OK).send(booking);
}

export async function createBooking(req: AuthenticatedRequest, res: Response) {
  const { roomId } = req.body as InputBookingBody;
  const { userId } = req;

  const booking = await bookingService.createBooking(roomId, userId);

  res.status(httpStatus.OK).send({ bookingId: booking.id });
}

export async function updateBooking(req: AuthenticatedRequest, res: Response) {
  const { roomId } = req.body as InputBookingBody;
  const { userId } = req;
  const bookingId = Number(req.params.bookingId);

  const booking = await bookingService.updateBooking(roomId, userId, bookingId);

  res.status(httpStatus.OK).send({ bookingId: booking.id });
}
