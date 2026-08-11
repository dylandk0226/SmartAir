// MOCK: replace the whole database layer so no real SQL Server call is made.
jest.mock('../../models/BookingModel');
jest.mock('../../models/ServiceRecordModel');

const BookingModel = require('../../models/BookingModel');
const BookingController = require('../../controllers/BookingController');

function buildRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe('BookingController.createBooking - Mock / Stub / Spy', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  test('saves the booking and responds 201 with the created record', async () => {
    // Arrange
    const req = {
      body: {
        service_type: 'maintenance',
        preferred_date: '2027-03-15',
        preferred_time: 'morning',
        service_address: '123 Orchard Road',
        contact_phone: '91234567',
      },
    };
    const res = buildRes();

    // STUB: fixed test data returned by the mocked database layer.
    const stubbedBooking = { booking_id: 101, status: 'pending', ...req.body };
    BookingModel.createBooking.mockResolvedValue(stubbedBooking);

    // Act
    await BookingController.createBooking(req, res);

    // Assert
    // SPY: verify the controller called the data layer with date-formatted data.
    expect(BookingModel.createBooking).toHaveBeenCalledTimes(1);
    expect(BookingModel.createBooking).toHaveBeenCalledWith(
      expect.objectContaining({ service_type: 'maintenance', preferred_date: '2027-03-15' })
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(stubbedBooking);
  });

  test('logs and responds 500 when the database layer throws', async () => {
    // Arrange
    const req = {
      body: {
        service_type: 'repair',
        preferred_date: '2027-03-15',
        preferred_time: 'evening',
        service_address: '50 Bishan Street 13',
        contact_phone: '98765432',
      },
    };
    const res = buildRes();
    // STUB the mock to simulate a database failure.
    BookingModel.createBooking.mockRejectedValue(new Error('DB connection lost'));
    // SPY: watch the real console.error (it still runs) to confirm the error is logged.
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Act
    await BookingController.createBooking(req, res);

    // Assert
    expect(errorSpy).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'DB connection lost' });
  });
});
