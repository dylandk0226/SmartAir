const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');
const assert = require('assert');

const BASE_URL = process.env.BASE_URL || 'https://smartair-1vb7.onrender.com';
const USERNAME = process.env.E2E_USERNAME || 'admin1';
const PASSWORD = process.env.E2E_PASSWORD || 'Admin123!';

// A booking date 7 days from now
const preferredDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  .toISOString()
  .split('T')[0];

// Set a React-controlled input's value so the change is registered.
async function setReactInput(driver, element, value) {
  await driver.executeScript(
    `const input = arguments[0], val = arguments[1];
     const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
     setter.call(input, val);
     input.dispatchEvent(new Event('input', { bubbles: true }));`,
    element,
    value
  );
}

async function run() {
  const driver = await new Builder().forBrowser('chrome').build();

  try {
    // Step 1: Log in
    await driver.get(`${BASE_URL}/login`);
    await driver.wait(until.elementLocated(By.css('input[name="username"]')), 10000);
    await driver.findElement(By.css('input[name="username"]')).sendKeys(USERNAME);
    await driver.findElement(By.css('input[name="password"]')).sendKeys(PASSWORD);
    await driver.findElement(By.css('button[type="submit"]')).click();
    console.log('Logged in');

    await driver.wait(async () => {
      const url = await driver.getCurrentUrl();
      return !url.includes('/login');
    }, 15000);

    // Step 2: Open the New Booking form
    await driver.get(`${BASE_URL}/bookings/new/admin`);
    await driver.wait(until.elementLocated(By.css('select[name="service_type"]')), 10000);
    console.log('Opened New Booking form');

    // Step 3: Fill in the booking (Locate -> Act)
    const customerOptions = await driver.findElements(
      By.css('select[name="customer_id"] option')
    );
    if (customerOptions.length > 1) {
      await customerOptions[1].click();
    }

    await driver.findElement(By.css('select[name="service_type"] option[value="maintenance"]')).click();

    const dateInput = await driver.findElement(By.css('input[name="preferred_date"]'));
    await setReactInput(driver, dateInput, preferredDate);

    await driver.findElement(By.css('select[name="preferred_time"] option[value="morning"]')).click();
    await driver.findElement(By.css('textarea[name="service_address"]')).sendKeys('123 Orchard Road, Singapore');
    await driver.findElement(By.css('input[name="postal_code"]')).sendKeys('238888');
    await driver.findElement(By.css('input[name="contact_phone"]')).sendKeys('91234567');
    console.log('Filled in booking details');

    // Step 4: Submit
    await driver.findElement(By.css('button[type="submit"]')).click();
    console.log('Clicked Submit');

    // Step 5: Wait + Assert the UI changed
    const successLocator = By.xpath("//*[contains(text(), 'Booking created successfully')]");
    await driver.wait(until.elementLocated(successLocator), 15000);
    const successText = await driver.findElement(successLocator).getText();
    assert.ok(successText.includes('Booking created successfully'));
    console.log('Final Result Verified: booking created successfully');

    console.log('UI TEST PASSED');
  } finally {
    await driver.quit();
  }
}

run().catch((err) => {
  if (err.name === 'SessionNotCreatedError' || err.message.includes('SessionNotCreatedError')) {
    console.error('\n⚠️  ChromeDriver Version Mismatch ⚠️');
    console.error('Please update your ChromeDriver to match your Chrome browser version.');
    console.error('Try running: npm install chromedriver@latest --save-dev\n');
  } else {
    console.error('❌ UI Test Failed', err);
  }
  process.exit(1);
});