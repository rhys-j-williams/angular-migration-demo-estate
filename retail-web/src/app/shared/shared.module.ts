import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { CnA11yModule } from '@meridian/canopy-ui/a11y';
import { CnButtonModule, CnIconButtonModule, CnMenuModule } from '@meridian/canopy-ui/actions';
import { CnDisclosureModule } from '@meridian/canopy-ui/content';
import {
  CnAccountCardModule,
  CnBadgeModule,
  CnCardModule,
  CnDataTableModule,
  CnDividerModule,
  CnExpansionModule,
  CnFilterChipsModule,
  CnListModule,
  CnSkeletonModule,
  CnVirtualListModule
} from '@meridian/canopy-ui/data-display';
import { CnErrorSummaryModule, CnProgressModule } from '@meridian/canopy-ui/feedback';
import { CnFormsModule } from '@meridian/canopy-ui/forms';
import { CnIconModule } from '@meridian/canopy-ui/icons';
import { CnPageHeaderModule, CnPageShellModule } from '@meridian/canopy-ui/layout';
import { CnStepperShellModule, CnTabsModule } from '@meridian/canopy-ui/navigation';
import { CnBottomSheetModule, CnDialogShellModule, CnToastModule, CnTooltipModule } from '@meridian/canopy-ui/overlays';

import { EmptyStateComponent } from './components/empty-state/empty-state.component';
import { ErrorBannerComponent } from './components/error-banner/error-banner.component';
import { LoadingPanelComponent } from './components/loading-panel/loading-panel.component';
import { MaskedNumberComponent } from './components/masked-number/masked-number.component';
import { PageSectionComponent } from './components/page-section/page-section.component';
import { AutofocusDirective } from './directives/autofocus.directive';
import { TrimOnBlurDirective } from './directives/trim-on-blur.directive';
import { AccountLabelPipe } from './pipes/account-label.pipe';
import { MinorAmountPipe } from './pipes/minor-amount.pipe';
import { RelativeDatePipe } from './pipes/relative-date.pipe';
import { TransactionSignPipe } from './pipes/transaction-sign.pipe';

const MATERIAL = [MatFormFieldModule, MatInputModule, MatIconModule, MatDialogModule];

const CANOPY = [
  CnA11yModule,
  CnIconModule,
  CnButtonModule,
  CnIconButtonModule,
  CnMenuModule,
  CnFormsModule,
  CnAccountCardModule,
  CnBadgeModule,
  CnCardModule,
  CnDataTableModule,
  CnDividerModule,
  CnExpansionModule,
  CnFilterChipsModule,
  CnListModule,
  CnSkeletonModule,
  CnVirtualListModule,
  CnErrorSummaryModule,
  CnProgressModule,
  CnPageHeaderModule,
  CnPageShellModule,
  CnStepperShellModule,
  CnTabsModule,
  CnBottomSheetModule,
  CnDialogShellModule,
  CnToastModule,
  CnTooltipModule,
  CnDisclosureModule
];

const DECLARATIONS = [
  EmptyStateComponent,
  ErrorBannerComponent,
  LoadingPanelComponent,
  MaskedNumberComponent,
  PageSectionComponent,
  AutofocusDirective,
  TrimOnBlurDirective,
  AccountLabelPipe,
  MinorAmountPipe,
  RelativeDatePipe,
  TransactionSignPipe
];

/**
 * Imported by every feature module. Re-exports Canopy, flex-layout, forms and ngx-translate so
 * feature modules have one import. Do not add services here; providedIn: 'root' or the feature
 * module.
 *
 * FlexLayoutModule is here because roughly every feature template still uses fxLayout for its
 * grid. Replacing it with CSS grid is MOL-4478 and has been "next quarter" since 2023.
 */
@NgModule({
  declarations: DECLARATIONS,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, FlexLayoutModule, TranslateModule, ...MATERIAL, ...CANOPY],
  exports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, FlexLayoutModule, TranslateModule, ...MATERIAL, ...CANOPY, ...DECLARATIONS]
})
export class SharedModule {}
