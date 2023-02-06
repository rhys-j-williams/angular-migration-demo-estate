import { LoginPage } from './page-objects/login.po';
import { TransferWizardPage } from './page-objects/transfer-wizard.po';

describe('internal transfer', () => {
  const login = new LoginPage();
  const wizard = new TransferWizardPage();

  beforeAll(async () => {
    await login.navigateTo();
    await login.signIn('e2e.customer.one@example.com', 'CHANGEME-e2e-password');
    await login.answerMfa();
  });

  it('rejects a transfer between the same account', async () => {
    await wizard.navigateTo();
    await wizard.chooseAccounts('4417', '4417');
    await wizard.enterAmount('25.00');
    await wizard.next();
    expect(await wizard.validationErrors()).toContain('Choose two different accounts.');
  });

  // Skipped since MOL-3644: the mock BFF started returning the confirmation number
  // asynchronously and this races the toast. Not worth fixing in Protractor.
  xit('completes a small transfer without step-up', async () => {
    await wizard.navigateTo();
    await wizard.chooseAccounts('4417', '9083');
    await wizard.enterAmount('25.00', 'e2e');
    await wizard.next();
    await wizard.next();
    await wizard.submit();
    expect(await wizard.confirmationNumber()).toMatch(/^TRF-/);
  });
});
