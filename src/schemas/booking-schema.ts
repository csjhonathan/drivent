import Joi from 'joi';
import { InputBookingBody } from '@/protocols';

export const inputBookingSchema = Joi.object<InputBookingBody>({
  roomId: Joi.number().required(),
});
