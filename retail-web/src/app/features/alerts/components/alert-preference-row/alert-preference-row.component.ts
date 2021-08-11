import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { AlertPreference, Channel } from '../../../../core/api/models';

/** One alert: toggle, channels, threshold. Purely presentational; the parent owns persistence. */
@Component({
  selector: 'mol-alert-preference-row',
  templateUrl: './alert-preference-row.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertPreferenceRowComponent {
  @Input() preference!: AlertPreference;
  @Input() busy = false;
  @Output() readonly enabledChange = new EventEmitter<boolean>();
  @Output() readonly channelsChange = new EventEmitter<Channel[]>();
  @Output() readonly thresholdChange = new EventEmitter<number>();

  editingThreshold = false;
  thresholdMajor: number | null = null;

  get hasThreshold(): boolean {
    return this.preference.thresholdMinor !== undefined;
  }

  startThreshold(): void {
    this.thresholdMajor = (this.preference.thresholdMinor ?? 0) / 100;
    this.editingThreshold = true;
  }

  saveThreshold(): void {
    if (this.thresholdMajor === null || this.thresholdMajor < 0) return;
    const minor = Math.round(this.thresholdMajor * 100);
    this.editingThreshold = false;
    if (minor !== this.preference.thresholdMinor) this.thresholdChange.emit(minor);
  }
}
