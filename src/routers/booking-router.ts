import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { getBookingByUserId } from '@/controllers/booking-controller';

const bookingRouter = Router();

bookingRouter.use(authenticateToken);
bookingRouter.get('/', getBookingByUserId);

export { bookingRouter };
