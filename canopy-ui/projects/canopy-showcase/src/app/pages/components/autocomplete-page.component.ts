import { Component } from '@angular/core';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { CnAutocompleteSource } from '@meridian/canopy-ui/forms';
import { ShowcaseFixturesService } from '../../shared/fixtures.service';

@Component({
  selector: 'cs-autocomplete-page',
  template: `
    <cs-demo-page title="cn-autocomplete" selector="cn-autocomplete" importFrom="forms" imports="CnAutocompleteModule, CnAutocompleteSource" lede="Debounced async lookup over an Observable source.">

  <cs-demo-section title="Payee lookup" note="source is a function returning an Observable; the component debounces, drops stale responses and swallows errors into an empty list.">
    <div style="max-width: 420px">
      <cn-autocomplete label="Pay to" placeholder="Start typing a payee" [source]="search" [minLength]="1" [debounce]="200" [(ngModel)]="payee"
                       hint="Simulated 300ms latency" (optionSelected)="chosen = $event.label"></cn-autocomplete>
    </div>
    <p class="cs-muted">Chosen: {{ chosen || 'none' }}</p>
  </cs-demo-section>
    </cs-demo-page>
  `
})
export class AutocompletePageComponent {
  payee: unknown = null;
  chosen = '';
  readonly search: CnAutocompleteSource<string> = (q: string) => {
    const needle = q.toLowerCase();
    const hits = this.fixtures.estate.payees
      .filter(p => p.name.toLowerCase().includes(needle))
      .slice(0, 8)
      .map(p => ({ value: p.payeeId, label: p.name, description: p.type }));
    return of(hits).pipe(delay(300));
  };
  constructor(private readonly fixtures: ShowcaseFixturesService) {}
}
