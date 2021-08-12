import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CnFilterChip } from '@meridian/canopy-ui/data-display';

import { Channel } from '../../../../core/api/models';
import { selectProfile } from '../../../../core/store/session';

/**
 * Push / SMS / email / in-app chips. SMS is only offered when the profile has a mobile number;
 * in-app cannot be removed from regulatory alerts because it is the delivery of record.
 */
@Component({
  selector: 'mol-channel-picker',
  templateUrl: './channel-picker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChannelPickerComponent implements OnInit {
  @Input() value: Channel[] = [];
  @Input() regulatory = false;
  @Input() disabled = false;
  @Output() readonly valueChange = new EventEmitter<Channel[]>();

  chips$!: Observable<CnFilterChip<Channel>[]>;

  constructor(private readonly store: Store) {}

  ngOnInit(): void {
    this.chips$ = this.store.select(selectProfile).pipe(
      map(profile => {
        const hasMobile = !!profile?.mobile;
        return [
          { value: 'in-app', label: 'In app', icon: 'notifications', disabled: this.regulatory },
          { value: 'push', label: 'Push', icon: 'phone_iphone' },
          { value: 'sms', label: hasMobile ? 'Text message' : 'Text message (add a mobile number)', icon: 'sms', disabled: !hasMobile },
          { value: 'email', label: 'Email', icon: 'mail' }
        ] as CnFilterChip<Channel>[];
      })
    );
  }

  onChange(next: Channel[]): void {
    const cleaned = this.regulatory && !next.includes('in-app') ? ['in-app', ...next] : next;
    if (!cleaned.length) return; // an enabled alert with no channel is meaningless; the parent toggles instead
    this.valueChange.emit(cleaned as Channel[]);
  }
}
