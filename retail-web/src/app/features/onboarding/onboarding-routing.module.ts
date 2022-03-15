import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UnsavedChangesGuard } from '../../core/guards';
import { OnboardingStartComponent } from './components/onboarding-start/onboarding-start.component';
import { IdentityStepComponent } from './components/identity-step/identity-step.component';
import { ContactStepComponent } from './components/contact-step/contact-step.component';
import { ProductStepComponent } from './components/product-step/product-step.component';
import { FundingStepComponent } from './components/funding-step/funding-step.component';
import { ReviewStepComponent } from './components/review-step/review-step.component';

const routes: Routes = [
  { path: '', component: OnboardingStartComponent },
  { path: 'identity', component: IdentityStepComponent, canDeactivate: [UnsavedChangesGuard] },
  { path: 'contact', component: ContactStepComponent, canDeactivate: [UnsavedChangesGuard] },
  { path: 'product', component: ProductStepComponent, canDeactivate: [UnsavedChangesGuard] },
  { path: 'funding', component: FundingStepComponent, canDeactivate: [UnsavedChangesGuard] },
  { path: 'review', component: ReviewStepComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OnboardingRoutingModule {}
