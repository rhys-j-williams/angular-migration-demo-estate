import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AlertsHomeComponent } from './components/alerts-home/alerts-home.component';
import { AlertHistoryComponent } from './components/alert-history/alert-history.component';

const routes: Routes = [
  { path: '', component: AlertsHomeComponent },
  { path: 'history', component: AlertHistoryComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AlertsRoutingModule {}
