const { calculateNextServiceDate } = require('../../controllers/BookingController');

describe('Booking Logic Unit Tests - calculateNextServiceDate', () => {
  test('maintenance booking schedules the next service 3 months later', () => {
    // Arrange
    const serviceDate = '2027-01-15';

    // Act
    const nextDate = calculateNextServiceDate(serviceDate, 'maintenance');

    // Assert
    expect(nextDate).toBe('2027-04-15');
  });

  test('repair booking schedules the next service 6 months later', () => {
    // Arrange
    const serviceDate = '2027-01-15';

    // Act
    const nextDate = calculateNextServiceDate(serviceDate, 'repair');

    // Assert
    expect(nextDate).toBe('2027-07-15');
  });

  test('an unknown service type falls back to the default 3 months (edge case)', () => {
    // Arrange
    const serviceDate = '2027-01-15';

    // Act
    const nextDate = calculateNextServiceDate(serviceDate, 'deep-clean');

    // Assert
    expect(nextDate).toBe('2027-04-15');
  });
});
