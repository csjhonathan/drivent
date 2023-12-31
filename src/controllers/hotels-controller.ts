import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import hotelsService from '@/services/hotels-service';

export async function getAllHotels(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const hotels = await hotelsService.getAllHotels(userId);

  res.send(hotels).status(httpStatus.OK);
}

type AuthenticatedRequestWithParam = AuthenticatedRequest & { params: { hotelId: number } };

export async function getHotelWithRoomsById(req: AuthenticatedRequestWithParam, res: Response) {
  const { hotelId } = req.params;
  const { userId } = req;

  const hotelWithRooms = await hotelsService.getHotelWithRoomsById(userId, Number(hotelId));

  res.send(hotelWithRooms).status(httpStatus.OK);
}
