import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { CnSelectOption } from '@meridian/canopy-ui/forms';
import { CnToastService } from '@meridian/canopy-ui/overlays';

import { AppError } from '../../../../core/errors/app-error.model';
import { HasUnsavedChanges } from '../../../../core/guards/unsaved-changes.guard';
import { MessagesApiService } from '../../../../core/api/messages-api.service';
import { messagesActions } from '../../store/messages.actions';

/** Compose a new thread. */
@Component({
  selector: 'mol-compose-message',
  templateUrl: './compose-message.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComposeMessageComponent implements HasUnsavedChanges {
  readonly form = new FormGroup({
      topic: new FormControl<string | null>(null, { nonNullable: false, validators: [Validators.required] }),
      subject: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(120)] }),
      body: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(4000)] })
  });
  readonly topicOptions: CnSelectOption<string>[] = [
    { value: 'accounts', label: $localize`:@@messages.composeMessage.topic.accounts:Accounts and balances` },
    { value: 'cards', label: $localize`:@@messages.composeMessage.topic.cards:Cards` },
    { value: 'payments', label: $localize`:@@messages.composeMessage.topic.payments:Transfers and payments` },
    { value: 'fraud', label: $localize`:@@messages.composeMessage.topic.fraud:Suspected fraud` },
    { value: 'other', label: $localize`:@@messages.composeMessage.topic.other:Something else` }
  ];
  readonly today = new Date().toISOString().slice(0, 10);
  submitted = false;
  saving = false;
  error: AppError | null = null;

  constructor(
    private readonly api: MessagesApiService,
    private readonly store: Store,
    private readonly router: Router,
    private readonly toast: CnToastService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  hasUnsavedChanges(): boolean {
    return this.form.dirty && !this.saving;
  }

  submit(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }
    this.saving = true;
    this.error = null;
    this.api.compose(this.form.value.topic ?? 'other', this.form.value.subject ?? '', this.form.value.body ?? '').subscribe({
      next: () => {
        this.saving = false;
        this.form.markAsPristine();
        this.toast.success($localize`:@@messages.composeMessage.saved:Message sent. We will reply within 1 business day.`);
        this.store.dispatch(messagesActions.load());
        void this.router.navigate(['/messages']);
      },
      error: (err: AppError) => {
        this.saving = false;
        this.error = err;
        this.cdr.markForCheck();
      }
    });
  }

  cancel(): void {
    void this.router.navigate(['/messages']);
  }
}
