import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Push / SMS / email / in-app chips, with SMS requiring a verified mobile. */
@Component({
  selector: 'mol-channel-picker',
  templateUrl: './channel-picker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChannelPickerComponent {}
