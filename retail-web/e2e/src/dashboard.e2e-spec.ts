import { browser } from 'protractor';
import { DashboardPage } from './page-objects/dashboard.po';
import { LoginPage } from './page-objects/login.po';

// Last green run: Jenkins retail-web-e2e #412, 2023-02-09. See protractor.conf.js.
describe('dashboard', () => {
  const login = new LoginPage();
  const dashboard = new DashboardPage();

  beforeAll(async () => {
    await login.navigateTo();
    await login.signIn('e2e.customer.one@example.com', 'CHANGEME-e2e-password');
    await login.answerMfa();
  });

  it('greets the customer by first name', async () => {
    await dashboard.waitForLoad();
    expect(await dashboard.greeting()).toMatch(/^Good (morning|afternoon|evening), /);
  });

  it('renders one card per open account', async () => {
    await dashboard.waitForLoad();
    const balances = await dashboard.accountBalances();
    expect(balances.length).toBeGreaterThan(1);
    balances.forEach(b => expect(b).toMatch(/^-?\$[\d,]+\.\d{2}$/));
  });

  afterEach(async () => {
    const logs = await browser.manage().logs().get('browser');
    const severe = logs.filter(l => l.level.name === 'SEVERE');
    expect(severe).toEqual([]);
  });
});
