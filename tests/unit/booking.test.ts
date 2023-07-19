import faker from '@faker-js/faker';
import bookingRepository from '@/repositories/booking-repository';
import bookingService from '@/services/booking-service';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('booking service test', () => {
  it('Should return no data and error if user has no reservations', () => {
    const bookingMock = jest.spyOn(bookingRepository, 'findBookingByUserId');
    const userId = faker.datatype.number();

    bookingMock.mockImplementationOnce((userId: number) => {
      return null;
    });

    const promise = bookingService.findBookingByUserId(userId);

    expect(bookingMock).toBeCalledTimes(1);
    expect(promise).rejects.toEqual({
      name: 'NotFoundError',
      message: 'No result for this search!',
    });
  });
});
