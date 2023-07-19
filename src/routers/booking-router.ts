import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import { createBooking, getBookingByUserId } from '@/controllers/booking-controller';
import { inputBookingSchema } from '@/schemas/booking-schema';

const bookingRouter = Router();

bookingRouter.use(authenticateToken);
bookingRouter.get('/', getBookingByUserId);
bookingRouter.post('/', validateBody(inputBookingSchema), createBooking);
export { bookingRouter };
