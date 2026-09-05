import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { CnA11yAnnouncerService } from '@meridian/canopy-ui/a11y';
import { CnMenuItem } from '@meridian/canopy-ui/actions';
import { CnAccountSummary, CnColumn, CnFilterChip, CnRowSelection } from '@meridian/canopy-ui/data-display';
import { CnDateRange, CnSelectOption } from '@meridian/canopy-ui/forms';
import { CnDialogService, CnToastService } from '@meridian/canopy-ui/overlays';
import { ShowcaseFixturesService, TxnRow } from '../../shared/fixtures.service';

type StatusFilter = TxnRow['status'];

/**
 * The page the presenters use. It is deliberately a plausible slice of Meridian Online rather
 * than a component gallery: pick an account, filter its activity, move money, get a toast.
 */
@Component({
  selector: 'cs-dashboard-page',
  templateUrl: './dashboard-page.component.html'
})
export class DashboardPageComponent {
  @ViewChild('transferDialog') transferDialog!: TemplateRef<unknown>;

  readonly accounts: CnAccountSummary[];
  selected: CnAccountSummary;
  rows: TxnRow[] = [];
  filtered: TxnRow[] = [];
  loading = false;
  tableSelection: CnRowSelection<TxnRow> | null = null;

  statusFilter: StatusFilter[] = [];
  channelFilter: string[] = [];
  range: CnDateRange = { start: null, end: null };

  readonly statusChips: CnFilterChip<StatusFilter>[] = [
    { value: 'posted', label: 'Posted' },
    { value: 'pending', label: 'Pending' },
    { value: 'disputed', label: 'Disputed' },
    { value: 'reversed', label: 'Reversed' }
  ];
  channelChips: CnFilterChip<string>[] = [];

  readonly columns: CnColumn<TxnRow>[] = [
    { key: 'postedAt', header: 'Date', type: 'date', width: '120px' },
    { key: 'description', header: 'Description', cellClass: 'cn-cell--strong' },
    { key: 'merchant', header: 'Merchant' },
    { key: 'category', header: 'Category', type: 'template', sortable: false },
    { key: 'status', header: 'Status', type: 'status', width: '110px' },
    { key: 'amount', header: 'Amount', type: 'currency', width: '140px' },
    { key: 'balance', header: 'Balance', type: 'currency', width: '150px', cellClass: 'cn-cell--muted' }
  ];

  readonly accountActions: CnMenuItem[] = [
    { id: 'statements', label: 'Statements', icon: 'cn:document' },
    { id: 'nickname', label: 'Rename account', icon: 'cn:settings' },
    { id: 'alerts', label: 'Alert preferences', icon: 'cn:bell' },
    { id: 'lock', label: 'Freeze account', icon: 'cn:lock', dividerBefore: true, destructive: true }
  ];

  readonly transferForm = this.fb.group({
    to: [null as string | null, Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    memo: ['']
  });
  readonly payeeOptions: CnSelectOption<string>[];
  transferBusy = false;
  transferSubmitted = false;
  private transferRef: MatDialogRef<unknown> | null = null;

  constructor(
    private readonly fixtures: ShowcaseFixturesService,
    private readonly fb: FormBuilder,
    private readonly dialog: CnDialogService,
    private readonly toast: CnToastService,
    private readonly announcer: CnA11yAnnouncerService
  ) {
    this.accounts = fixtures.summaries();
    this.selected = this.accounts[0];
    this.payeeOptions = [
      ...this.accounts.slice(1).map(a => ({ value: a.id, label: `${a.nickname} (${a.last4})`, group: 'My accounts' })),
      ...fixtures.payees.map(p => ({ value: p.payeeId, label: p.nickname || p.name, description: `ending ${p.accountNumberLastFour}`, group: 'Payees' }))
    ];
    this.load();
  }

  get available(): number {
    return this.selected.availableBalance ?? this.selected.currentBalance;
  }

  get totalDeposits(): number {
    return this.accounts.filter(a => a.kind !== 'credit' && a.kind !== 'loan').reduce((s, a) => s + a.currentBalance, 0);
  }

  get totalOwed(): number {
    return this.accounts.filter(a => a.kind === 'credit' || a.kind === 'loan').reduce((s, a) => s + Math.abs(a.currentBalance), 0);
  }

  pick(account: CnAccountSummary): void {
    if (account.id === this.selected.id) {
      return;
    }
    this.selected = account;
    this.load();
  }

  load(): void {
    this.loading = true;
    this.tableSelection = null;
    // Simulates the BFF round trip so the skeleton and aria-busy states are visible on stage.
    setTimeout(() => {
      this.rows = this.fixtures.transactions(this.selected.id);
      const channels = Array.from(new Set(this.rows.map(r => r.channel))).sort();
      this.channelChips = channels.map(c => ({ value: c, label: c.toUpperCase(), count: this.rows.filter(r => r.channel === c).length }));
      this.applyFilters();
      this.loading = false;
      this.announcer.announce(`${this.selected.nickname} activity loaded, ${this.filtered.length} transactions`);
    }, 400);
  }

  applyFilters(): void {
    this.filtered = this.rows.filter(r => {
      if (this.statusFilter.length && !this.statusFilter.includes(r.status)) {
        return false;
      }
      if (this.channelFilter.length && !this.channelFilter.includes(r.channel)) {
        return false;
      }
      const day = r.postedAt.slice(0, 10);
      if (this.range.start && day < this.range.start) {
        return false;
      }
      if (this.range.end && day > this.range.end) {
        return false;
      }
      return true;
    });
  }

  onStatus(values: StatusFilter[]): void {
    this.statusFilter = values;
    this.applyFilters();
  }

  onChannel(values: string[]): void {
    this.channelFilter = values;
    this.applyFilters();
  }

  onRange(range: CnDateRange): void {
    this.range = range;
    this.applyFilters();
  }

  onAction(item: CnMenuItem): void {
    if (item.id === 'lock') {
      this.dialog
        .confirm({
          title: 'Freeze this account?',
          message: `Card and ACH activity on ${this.selected.nickname} will decline until you unfreeze it. Scheduled payments are not affected.`,
          confirmLabel: 'Freeze account',
          destructive: true
        })
        .subscribe(ok => {
          if (ok) {
            this.selected = { ...this.selected, status: 'frozen' };
            this.toast.caution(`${this.selected.nickname} is frozen`, { action: 'Undo' }).onAction().subscribe(() => {
              this.selected = { ...this.selected, status: 'open' };
              this.toast.success('Account unfrozen');
            });
          }
        });
      return;
    }
    this.toast.show(`${item.label} is not part of the showcase`, { simple: true });
  }

  openTransfer(): void {
    this.transferForm.reset({ to: null, amount: null, memo: '' });
    this.transferSubmitted = false;
    this.transferRef = this.dialog.open(this.transferDialog, { size: 'md' });
  }

  cancelTransfer(): void {
    this.transferRef?.close();
  }

  submitTransfer(): void {
    this.transferSubmitted = true;
    if (this.transferForm.invalid) {
      this.transferForm.markAllAsTouched();
      return;
    }
    const amount = this.transferForm.value.amount ?? 0;
    if (amount > this.available) {
      this.transferForm.controls.amount.setErrors({ insufficient: true });
      return;
    }
    this.transferBusy = true;
    setTimeout(() => {
      this.transferBusy = false;
      this.transferRef?.close();
      const to = this.payeeOptions.find(o => o.value === this.transferForm.value.to);
      this.toast.success(`Transfer of ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)} to ${to?.label ?? 'payee'} scheduled`);
    }, 900);
  }

  dispute(): void {
    const count = this.tableSelection?.selected.length ?? 0;
    if (!count) {
      return;
    }
    this.dialog
      .confirm({
        title: count === 1 ? 'Dispute this transaction?' : `Dispute ${count} transactions?`,
        message: 'A provisional credit is applied within two business days while we investigate. You will get a letter at the address on file.',
        confirmLabel: 'Open dispute'
      })
      .subscribe(ok => {
        if (ok) {
          const ids = new Set(this.tableSelection?.selected.map(r => r.id));
          this.rows = this.rows.map(r => (ids.has(r.id) ? { ...r, status: 'disputed' } : r));
          this.applyFilters();
          this.toast.success(count === 1 ? 'Dispute opened' : `${count} disputes opened`);
        }
      });
  }

  exportCsv(): void {
    this.toast.show('Export queued. You will get a secure message when the file is ready.', { tone: 'neutral' });
  }

  trackById(_: number, row: TxnRow): string {
    return row.id;
  }
}
