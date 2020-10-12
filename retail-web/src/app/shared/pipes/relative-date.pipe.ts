import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

/**
 * "Today", "Yesterday", "Tuesday", "12 Mar" or "12 Mar 2023". Used in transaction and alert lists.
 * moment is already in the bundle for the Material date adapter; do not add date-fns for this.
 */
@Pipe({ name: 'relativeDate' })
export class RelativeDatePipe implements PipeTransform {
  transform(value: string | Date | null | undefined, now: moment.MomentInput = undefined): string {
    if (!value) {
      return '';
    }
    const d = moment(value);
    const ref = moment(now);
    if (d.isSame(ref, 'day')) return $localize`:@@date.today:Today`;
    if (d.isSame(ref.clone().subtract(1, 'day'), 'day')) return $localize`:@@date.yesterday:Yesterday`;
    if (d.isAfter(ref.clone().subtract(6, 'days'), 'day')) return d.format('dddd');
    if (d.isSame(ref, 'year')) return d.format('D MMM');
    return d.format('D MMM YYYY');
  }
}
