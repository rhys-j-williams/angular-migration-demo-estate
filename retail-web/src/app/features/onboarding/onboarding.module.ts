import { NgModule } from '@angular/core';

import { SharedModule } from '../../shared/shared.module';
import { OnboardingRoutingModule } from './onboarding-routing.module';
import { OnboardingStartComponent } from './components/onboarding-start/onboarding-start.component';
import { IdentityStepComponent } from './components/identity-step/identity-step.component';
import { ContactStepComponent } from './components/contact-step/contact-step.component';
import { ProductStepComponent } from './components/product-step/product-step.component';
import { FundingStepComponent } from './components/funding-step/funding-step.component';
import { ReviewStepComponent } from './components/review-step/review-step.component';

/** Open an account, unauthenticated. Untyped forms; the flow predates typed forms and shares validators with the 2021 marketing site. */
@NgModule({
  declarations: [
    OnboardingStartComponent,
    IdentityStepComponent,
    ContactStepComponent,
    ProductStepComponent,
    FundingStepComponent,
    ReviewStepComponent
  ],
  imports: [
    SharedModule,
    OnboardingRoutingModule
  ]
})
export class OnboardingModule {}
