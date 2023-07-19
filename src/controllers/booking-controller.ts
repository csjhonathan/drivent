import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import bookingService from '@/services/booking-service';

export async function getBookingByUserId(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const booking = await bookingService.findBookingByUserId(userId);
  res.status(httpStatus.OK).send(booking);
}
