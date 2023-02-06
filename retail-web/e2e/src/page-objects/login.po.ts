import { browser, by, element, ExpectedConditions as EC } from 'protractor';

/**
 * Drives the Keystone mock login screen (mock-external, port 4400). The real Keystone hosted
 * page has different ids; this page object is only good against the mock, which is all CI ever
 * had. Test users live in @meridian/domain-fixtures (see `customers.json`, the first three
 * carry the `e2e` tag).
 */
export class LoginPage {
  async navigateTo(): Promise<void> {
    await browser.get(browser.baseUrl);
    await browser.wait(EC.urlContains('/oauth2/v1/authorize'), 10000, 'no redirect to Keystone');
  }

  async signIn(username: string, password: string): Promise<void> {
    await element(by.id('username')).sendKeys(username);
    await element(by.id('password')).sendKeys(password);
    await element(by.css('button[type="submit"]')).click();
    await browser.wait(EC.urlContains('/dashboard'), 15000, 'did not land on the dashboard');
  }

  async answerMfa(code = '000000'): Promise<void> {
    const otp = element(by.id('otp'));
    if (await otp.isPresent()) {
      await otp.sendKeys(code);
      await element(by.css('button[type="submit"]')).click();
    }
  }
}
