import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ResumenMensualPageRoutingModule } from './resumen-mensual-routing.module';

import { ResumenMensualPage } from './resumen-mensual.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ResumenMensualPageRoutingModule,
    SharedModule
  ],
  declarations: [ResumenMensualPage]
})
export class ResumenMensualPageModule {}
