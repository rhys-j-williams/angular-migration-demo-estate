import { browser, by, element, ElementFinder, ExpectedConditions as EC } from 'protractor';

export class DashboardPage {
  readonly accountCards = element.all(by.css('mol-account-summary-card'));
  readonly quickTransfer = element(by.css('mol-quick-transfer'));
  readonly alertsDigest = element(by.css('mol-alerts-digest'));

  async waitForLoad(): Promise<void> {
    await browser.wait(EC.presenceOf(this.accountCards.first()), 10000, 'no account cards rendered');
  }

  async greeting(): Promise<string> {
    return element(by.css('mol-dashboard-overview h1')).getText();
  }

  async accountBalances(): Promise<string[]> {
    return this.accountCards.map(async card => {
      // cn-money renders the formatted amount into a span; the raw value is on data-amount.
      const money = (card as ElementFinder).element(by.css('cn-money span'));
      return money.getText();
    });
  }

  async openAccount(index: number): Promise<void> {
    await this.accountCards.get(index).click();
    await browser.wait(EC.urlContains('/accounts/'), 5000);
  }
}
