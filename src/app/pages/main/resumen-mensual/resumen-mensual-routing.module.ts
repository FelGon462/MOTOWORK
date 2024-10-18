import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ResumenMensualPage } from './resumen-mensual.page';

const routes: Routes = [
  {
    path: '',
    component: ResumenMensualPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ResumenMensualPageRoutingModule {}
