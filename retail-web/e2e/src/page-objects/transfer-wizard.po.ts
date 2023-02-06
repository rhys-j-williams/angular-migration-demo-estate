import { browser, by, element, ExpectedConditions as EC } from 'protractor';

/**
 * Transfer wizard, four steps. The MFA step-up on step 3 is driven by the amount, so keep
 * e2e amounts below the configured threshold (env.json transfers.mfaStepUpThresholdMinor)
 * unless the test is specifically about step-up; the Keystone mock accepts 000000.
 */
export class TransferWizardPage {
  async navigateTo(): Promise<void> {
    await browser.get(browser.baseUrl + 'transfers/new');
    await browser.wait(EC.presenceOf(element(by.css('mol-transfer-wizard'))), 10000);
  }

  async chooseAccounts(fromLast4: string, toLast4: string): Promise<void> {
    await element(by.css('[formcontrolname="fromAccountId"]')).click();
    await element(by.cssContainingText('mat-option', fromLast4)).click();
    await element(by.css('[formcontrolname="toAccountId"]')).click();
    await element(by.cssContainingText('mat-option', toLast4)).click();
  }

  async enterAmount(major: string, memo = ''): Promise<void> {
    const amount = element(by.css('[formcontrolname="amount"] input'));
    await amount.clear();
    await amount.sendKeys(major);
    if (memo) {
      await element(by.css('[formcontrolname="memo"]')).sendKeys(memo);
    }
  }

  async next(): Promise<void> {
    await element(by.buttonText('Continue')).click();
  }

  async submit(): Promise<void> {
    await element(by.buttonText('Submit transfer')).click();
    await browser.wait(EC.presenceOf(element(by.css('mol-transfer-confirmation'))), 10000);
  }

  async confirmationNumber(): Promise<string> {
    return element(by.css('mol-transfer-confirmation [data-test="confirmation-number"]')).getText();
  }

  async validationErrors(): Promise<string[]> {
    return element.all(by.css('mat-error')).map(e => e!.getText());
  }
}
