import { Type } from '@angular/core';
import { ButtonPageComponent } from './button-page.component';
import { IconButtonPageComponent } from './icon-button-page.component';
import { MenuPageComponent } from './menu-page.component';
import { CurrencyInputPageComponent } from './currency-input-page.component';
import { MaskedInputPageComponent } from './masked-input-page.component';
import { SelectPageComponent } from './select-page.component';
import { AutocompletePageComponent } from './autocomplete-page.component';
import { CheckboxPageComponent } from './checkbox-page.component';
import { RadioGroupPageComponent } from './radio-group-page.component';
import { TogglePageComponent } from './toggle-page.component';
import { DateRangePageComponent } from './date-range-page.component';
import { AmountSliderPageComponent } from './amount-slider-page.component';
import { AccountCardPageComponent } from './account-card-page.component';
import { DataTablePageComponent } from './data-table-page.component';
import { FilterChipsPageComponent } from './filter-chips-page.component';
import { BadgePageComponent } from './badge-page.component';
import { SkeletonPageComponent } from './skeleton-page.component';
import { CardPageComponent } from './card-page.component';
import { ListPageComponent } from './list-page.component';
import { ExpansionPageComponent } from './expansion-page.component';
import { DividerPageComponent } from './divider-page.component';
import { TabsPageComponent } from './tabs-page.component';
import { StepperShellPageComponent } from './stepper-shell-page.component';
import { DialogShellPageComponent } from './dialog-shell-page.component';
import { BottomSheetPageComponent } from './bottom-sheet-page.component';
import { ToastPageComponent } from './toast-page.component';
import { TooltipPageComponent } from './tooltip-page.component';
import { ProgressPageComponent } from './progress-page.component';
import { PageHeaderPageComponent } from './page-header-page.component';
import { PageShellPageComponent } from './page-shell-page.component';
import { A11yAnnouncerPageComponent } from './a11y-announcer-page.component';
import { DisclosurePageComponent } from './disclosure-page.component';

export interface ComponentPage {
  slug: string;
  selector: string;
  family: string;
  summary: string;
  component: Type<unknown>;
}

/** Order here is the order in the nav and the home index. Grouped by entry point, not alphabetically. */
export const COMPONENT_PAGES: ComponentPage[] = [
  { slug: 'button', selector: 'cn-button', family: 'Actions', summary: 'Primary, secondary, tertiary and destructive buttons with icon and loading states.', component: ButtonPageComponent },
  { slug: 'icon-button', selector: 'cn-icon-button', family: 'Actions', summary: 'Icon-only button with a mandatory aria-label, optional tooltip and badge.', component: IconButtonPageComponent },
  { slug: 'menu', selector: 'cn-menu', family: 'Actions', summary: 'Overflow action menu with dividers and destructive items.', component: MenuPageComponent },
  { slug: 'currency-input', selector: 'cn-currency-input', family: 'Forms', summary: 'Money field that formats on blur and exposes a number to the form.', component: CurrencyInputPageComponent },
  { slug: 'masked-input', selector: 'cn-masked-input', family: 'Forms', summary: 'Preset masks for phone, ZIP, account and routing numbers over ngx-mask.', component: MaskedInputPageComponent },
  { slug: 'select', selector: 'cn-select', family: 'Forms', summary: 'Single and multi select with grouped options and descriptions.', component: SelectPageComponent },
  { slug: 'autocomplete', selector: 'cn-autocomplete', family: 'Forms', summary: 'Debounced async lookup over an Observable source.', component: AutocompletePageComponent },
  { slug: 'checkbox', selector: 'cn-checkbox', family: 'Forms', summary: 'Checkbox with hint text and indeterminate parent state.', component: CheckboxPageComponent },
  { slug: 'radio-group', selector: 'cn-radio-group', family: 'Forms', summary: 'Fieldset-backed radio group with descriptions and inline layout.', component: RadioGroupPageComponent },
  { slug: 'toggle', selector: 'cn-toggle', family: 'Forms', summary: 'Slide toggle with on/off text and hint.', component: TogglePageComponent },
  { slug: 'date-range', selector: 'cn-date-range', family: 'Forms', summary: 'Start/end picker over the Material range picker with presets.', component: DateRangePageComponent },
  { slug: 'amount-slider', selector: 'cn-amount-slider', family: 'Forms', summary: 'Currency-formatted slider with thumb label and ticks.', component: AmountSliderPageComponent },
  { slug: 'account-card', selector: 'cn-account-card', family: 'Data display', summary: 'Account tile with masked number, balance hide toggle and status.', component: AccountCardPageComponent },
  { slug: 'data-table', selector: 'cn-data-table', family: 'Data display', summary: 'Sortable, pageable, selectable table over an in-memory array.', component: DataTablePageComponent },
  { slug: 'filter-chips', selector: 'cn-filter-chips', family: 'Data display', summary: 'Selectable chip row for filtering, single or multiple.', component: FilterChipsPageComponent },
  { slug: 'badge', selector: 'cn-badge', family: 'Data display', summary: 'Status pill in five tones, outline and dot variants.', component: BadgePageComponent },
  { slug: 'skeleton', selector: 'cn-skeleton', family: 'Data display', summary: 'Loading placeholders in text, rect and circle shapes.', component: SkeletonPageComponent },
  { slug: 'card', selector: 'cn-card', family: 'Data display', summary: 'Content container with title, actions and footer slots.', component: CardPageComponent },
  { slug: 'list', selector: 'cn-list', family: 'Data display', summary: 'Static or interactive item list with icon, secondary and meta text.', component: ListPageComponent },
  { slug: 'expansion', selector: 'cn-expansion', family: 'Data display', summary: 'Single expansion panel with summary line and two-way expanded state.', component: ExpansionPageComponent },
  { slug: 'divider', selector: 'cn-divider', family: 'Data display', summary: 'Horizontal or vertical rule with optional label.', component: DividerPageComponent },
  { slug: 'tabs', selector: 'cn-tabs', family: 'Navigation', summary: 'Lazy tab group with badges and icons on the labels.', component: TabsPageComponent },
  { slug: 'stepper-shell', selector: 'cn-stepper-shell', family: 'Navigation', summary: 'Linear stepper with per-step form controls and completion events.', component: StepperShellPageComponent },
  { slug: 'dialog-shell', selector: 'cn-dialog-shell', family: 'Overlays', summary: 'Dialog frame plus a service with sized open() and confirm().', component: DialogShellPageComponent },
  { slug: 'bottom-sheet', selector: 'cn-bottom-sheet', family: 'Overlays', summary: 'Mobile-first action sheet with drag handle.', component: BottomSheetPageComponent },
  { slug: 'toast', selector: 'cn-toast', family: 'Overlays', summary: 'Snackbar wrapper with tones, actions and sticky errors.', component: ToastPageComponent },
  { slug: 'tooltip', selector: 'cn-tooltip', family: 'Overlays', summary: 'cnTooltip directive with brand styling and a 300ms delay.', component: TooltipPageComponent },
  { slug: 'progress', selector: 'cn-progress', family: 'Feedback', summary: 'Determinate and indeterminate progress bars and spinners with thresholds.', component: ProgressPageComponent },
  { slug: 'page-header', selector: 'cn-page-header', family: 'Layout', summary: 'Title block with eyebrow, lede, breadcrumbs, back link and actions.', component: PageHeaderPageComponent },
  { slug: 'page-shell', selector: 'cn-page-shell', family: 'Layout', summary: 'Application frame: toolbar, responsive nav drawer, skip link, theme toggle.', component: PageShellPageComponent },
  { slug: 'a11y-announcer', selector: 'cn-a11y-announcer', family: 'Accessibility', summary: 'Live region announcements, focus trap and skip link directives.', component: A11yAnnouncerPageComponent },
  { slug: 'disclosure', selector: 'cn-disclosure', family: 'Content', summary: 'Renders CMS-managed disclosure copy by key, inline HTML as a fallback.', component: DisclosurePageComponent }
];

/** Static list for NgModule.declarations; the compiler cannot evaluate a .map() there. */
export const COMPONENT_PAGE_COMPONENTS = [
  ButtonPageComponent,
  IconButtonPageComponent,
  MenuPageComponent,
  CurrencyInputPageComponent,
  MaskedInputPageComponent,
  SelectPageComponent,
  AutocompletePageComponent,
  CheckboxPageComponent,
  RadioGroupPageComponent,
  TogglePageComponent,
  DateRangePageComponent,
  AmountSliderPageComponent,
  AccountCardPageComponent,
  DataTablePageComponent,
  FilterChipsPageComponent,
  BadgePageComponent,
  SkeletonPageComponent,
  CardPageComponent,
  ListPageComponent,
  ExpansionPageComponent,
  DividerPageComponent,
  TabsPageComponent,
  StepperShellPageComponent,
  DialogShellPageComponent,
  BottomSheetPageComponent,
  ToastPageComponent,
  TooltipPageComponent,
  ProgressPageComponent,
  PageHeaderPageComponent,
  PageShellPageComponent,
  A11yAnnouncerPageComponent,
  DisclosurePageComponent
];
