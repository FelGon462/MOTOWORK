import { Component, inject, Input, OnInit } from '@angular/core';
import { Document } from '../../models/document.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { UpdateDocumentComponent } from 'src/app/shared/components/update-document/update-document.component';

@Component({
  selector: 'app-documento',
  templateUrl: './documento.page.html',
  styleUrls: ['./documento.page.scss'],
})
export class DocumentoPage implements OnInit {

  firebaseService = inject(FirebaseService);
  utilsService = inject(UtilsService);
  modalTitle: string;;
  

  ngOnInit() {
  }

  async addUpdateDocument(documento?: Document){
    let modal = await this.utilsService.getModal({
      component: UpdateDocumentComponent,
      cssClass: 'add-update-modal',
      componentProps: { documento, title: documento ? 'Actualizar Documento' : 'Agregar Documento' }  

    })
  }

  descargar(){
    console.log('Descargando documento');
  }

  update(){
    console.log('Actualizando documento');
  }

  delete(){
    console.log('Eliminando documento');
  }

}
