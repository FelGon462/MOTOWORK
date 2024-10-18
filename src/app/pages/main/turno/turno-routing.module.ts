import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TurnoPage } from './turno.page';

const routes: Routes = [
  {
    path: '',
    component: TurnoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TurnoPageRoutingModule {}
