import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainPage } from './main.page';
import { DashboardPage } from './dashboard/dashboard.page';


const routes: Routes = [
  {
    path: '',
    component: MainPage
  },
  {
    path: '',
    component: MainPage,
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.module').then( m => m.DashboardPageModule)
      },
      {
        path: 'documento',
        loadChildren: () => import('./documento/documento.module').then( m => m.DocumentoPageModule)
      },
      {
        path: 'turno',
        loadChildren: () => import('./turno/turno.module').then( m => m.TurnoPageModule)
      },
      {
        path: 'profile',
        loadChildren: () => import('./profile/profile.module').then( m => m.ProfilePageModule)
      },
      {
        path: 'solicitudes',
        loadChildren: () => import('./solicitudes/solicitudes.module').then( m => m.SolicitudesPageModule)
      },
      {
        path: 'resumen-mensual',
        loadChildren: () => import('./resumen-mensual/resumen-mensual.module').then( m => m.ResumenMensualPageModule)
      },
      {
        path: '',
        redirectTo: '/main/dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/main/dashboard',
    pathMatch: 'full'
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainPageRoutingModule {}
