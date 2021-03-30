import { NgModule } from '@angular/core';
import { CnAmountSliderModule } from './amount-slider/amount-slider.module';
import { CnAutocompleteModule } from './autocomplete/autocomplete.module';
import { CnCheckboxModule } from './checkbox/checkbox.module';
import { CnCurrencyInputModule } from './currency-input/currency-input.module';
import { CnDateRangeModule } from './date-range/date-range.module';
import { CnMaskedInputModule } from './masked-input/masked-input.module';
import { CnRadioGroupModule } from './radio-group/radio-group.module';
import { CnSelectModule } from './select/select.module';
import { CnToggleModule } from './toggle/toggle.module';

const MODULES = [
  CnCurrencyInputModule, CnMaskedInputModule, CnSelectModule, CnAutocompleteModule, CnCheckboxModule,
  CnRadioGroupModule, CnToggleModule, CnDateRangeModule, CnAmountSliderModule
];

/** Convenience barrel. Prefer the individual modules in lazy routes. */
@NgModule({ imports: MODULES, exports: MODULES })
export class CnFormsModule {}
