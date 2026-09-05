import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { CnColumn } from '@meridian/canopy-ui/data-display';

import { SecureMessageThread } from '../../../../core/api/models';
import { messagesActions } from '../../store/messages.actions';
import { messagesSelectors } from '../../store/messages.selectors';

/** Conversation list. */
@Component({
  selector: 'mol-thread-list',
  templateUrl: './thread-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThreadListComponent implements OnInit {
  readonly rows$ = this.store.select(messagesSelectors.selectAll);
  readonly loading$ = this.store.select(messagesSelectors.selectLoading);
  readonly error$ = this.store.select(messagesSelectors.selectError);

  readonly columns: CnColumn<SecureMessageThread>[] = [
    { key: 'subject', header: $localize`:@@messages.threadList.col.subject:Subject` },
    { key: 'topic', header: $localize`:@@messages.threadList.col.topic:Topic` },
    { key: 'updatedAt', header: $localize`:@@messages.threadList.col.updatedAt:Updated`, type: 'date' },
    { key: 'status', header: $localize`:@@messages.threadList.col.status:Status` }
  ];

  constructor(private readonly store: Store, private readonly router: Router) {}

  ngOnInit(): void {
    this.store.dispatch(messagesActions.load());
  }

  reload(): void {
    this.store.dispatch(messagesActions.load());
  }

  open(row: SecureMessageThread): void {
    void this.router.navigate(['/messages', row.threadId]);
  }
}
