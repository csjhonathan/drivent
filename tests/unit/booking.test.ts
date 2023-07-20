import faker from '@faker-js/faker';
import bookingRepository from '@/repositories/booking-repository';
import bookingService from '@/services/booking-service';
import ticketsRepository from '@/repositories/tickets-repository';
import roomsRepository from '@/repositories/rooms-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET booking service test', () => {
  it('Should return notFoundError if user has no reservations', () => {
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

describe('POST booking service test', () => {
  it('Should return notFoundError if room does not exist', () => {
    const roomsMock = jest.spyOn(roomsRepository, 'findRoomById');
    const roomId = faker.datatype.number({ min: 1 });
    const userId = faker.datatype.number({ min: 1 });
    roomsMock.mockImplementationOnce((roomId: number): any => {
      return null;
    });

    const promise = bookingService.createBooking(roomId, userId);
    expect(promise).rejects.toEqual({
      name: 'NotFoundError',
      message: 'No result for this search!',
    });
    expect(roomsMock).toBeCalledTimes(1);
  });

  it('Should return forbiddenError if user ticket is remote', async () => {
    const roomsMock = jest.spyOn(roomsRepository, 'findRoomById');
    roomsMock.mockImplementationOnce((roomId: number): any => {
      return {
        capacity: 5,
      };
    });

    const bookingMock = jest.spyOn(bookingRepository, 'countBookingsByRoomId');
    bookingMock.mockImplementation((roomId: number): any => {
      return 1;
    });

    const enrollmentMock = jest.spyOn(enrollmentRepository, 'getUserEnrollment');
    enrollmentMock.mockImplementationOnce((userId: number): any => {
      return { id: 1 };
    });

    const ticketsMock = jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId');
    ticketsMock.mockImplementationOnce((enrollmentId: number): any => {
      return {
        status: 'PAID',
        TicketType: {
          isRemote: true,
          includesHotel: true,
        },
      };
    });

    const roomId = faker.datatype.number({ min: 1 });
    const userId = faker.datatype.number({ min: 1 });
    const promise = bookingService.createBooking(roomId, userId);

    await expect(promise).rejects.toEqual({
      name: 'ForbiddenError',
      message: 'Access denied!',
    });

    expect(roomsMock).toBeCalledTimes(1);
    expect(enrollmentMock).toBeCalledTimes(1);
    expect(ticketsMock).toBeCalledTimes(1);
  });

  it('Should return forbiddenError if user ticket does not include hotel', async () => {
    const roomsMock = jest.spyOn(roomsRepository, 'findRoomById');
    roomsMock.mockImplementationOnce((roomId: number): any => {
      return {
        capacity: 5,
      };
    });
    const bookingMock = jest.spyOn(bookingRepository, 'countBookingsByRoomId');
    bookingMock.mockImplementation((roomId: number): any => {
      return 1;
    });
    const enrollmentMock = jest.spyOn(enrollmentRepository, 'getUserEnrollment');
    enrollmentMock.mockImplementationOnce((userId: number): any => {
      return { id: 1 };
    });

    const ticketsMock = jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId');
    ticketsMock.mockImplementationOnce((enrollmentId: number): any => {
      return {
        status: 'PAID',
        TicketType: {
          isRemote: false,
          includesHotel: false,
        },
      };
    });

    const roomId = faker.datatype.number({ min: 1 });
    const userId = faker.datatype.number({ min: 1 });
    const promise = bookingService.createBooking(roomId, userId);

    await expect(promise).rejects.toEqual({
      name: 'ForbiddenError',
      message: 'Access denied!',
    });

    expect(roomsMock).toBeCalledTimes(1);
    expect(enrollmentMock).toBeCalledTimes(1);
    expect(ticketsMock).toBeCalledTimes(1);
  });

  it('Should return forbiddenError if user ticket has not been paid', async () => {
    const roomsMock = jest.spyOn(roomsRepository, 'findRoomById');
    roomsMock.mockImplementationOnce((roomId: number): any => {
      return {
        capacity: 5,
      };
    });
    const bookingMock = jest.spyOn(bookingRepository, 'countBookingsByRoomId');
    bookingMock.mockImplementation((roomId: number): any => {
      return 1;
    });
    const enrollmentMock = jest.spyOn(enrollmentRepository, 'getUserEnrollment');
    enrollmentMock.mockImplementationOnce((userId: number): any => {
      return { id: 1 };
    });

    const ticketsMock = jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId');
    ticketsMock.mockImplementationOnce((enrollmentId: number): any => {
      return {
        status: 'RESERVED',
        TicketType: {
          isRemote: false,
          includesHotel: true,
        },
      };
    });

    const roomId = faker.datatype.number({ min: 1 });
    const userId = faker.datatype.number({ min: 1 });
    const promise = bookingService.createBooking(roomId, userId);

    await expect(promise).rejects.toEqual({
      name: 'ForbiddenError',
      message: 'Access denied!',
    });

    expect(roomsMock).toBeCalledTimes(1);
    expect(enrollmentMock).toBeCalledTimes(1);
    expect(ticketsMock).toBeCalledTimes(1);
  });

  it('Should return forbiddenError if if room has no vacancies', () => {
    const roomsMock = jest.spyOn(roomsRepository, 'findRoomById');
    roomsMock.mockImplementationOnce((roomId: number): any => {
      return {
        capacity: 4,
      };
    });

    const bookingMock = jest.spyOn(bookingRepository, 'countBookingsByRoomId');
    bookingMock.mockImplementation((roomId: number): any => {
      return 4;
    });

    const roomId = faker.datatype.number({ min: 1 });
    const userId = faker.datatype.number({ min: 1 });
    const promise = bookingService.createBooking(roomId, userId);

    expect(promise).rejects.toEqual({
      name: 'ForbiddenError',
      message: 'Access denied!',
    });

    expect(roomsMock).toBeCalledTimes(1);
  });
});
