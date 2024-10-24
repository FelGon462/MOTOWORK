import { Component, inject, OnInit } from '@angular/core';
import { Document } from '../../models/document.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { UpdateDocumentComponent } from 'src/app/shared/components/update-document/update-document.component';
import { User } from '../../models/user.model';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-documento',
  templateUrl: './documento.page.html',
  styleUrls: ['./documento.page.scss'],
})
export class DocumentoPage implements OnInit {

  firebaseService = inject(FirebaseService);
  utilsService = inject(UtilsService);

  loading: boolean = false;
  documentos: Document[] = [];

  ngOnInit() {}

  ionViewWillEnter() {
    this.getDocument();
  }

  user(): User {
    return this.utilsService.getLocalStorage('user');
  }

  getDocument() {
    const path = `users/${this.user().uid}/documents`;

    this.loading = true;

    let sub = this.firebaseService.getCollectionData(path)
      .snapshotChanges()
      .pipe(
        map(changes => changes.map(c => ({
          id: c.payload.doc.id,
          ...c.payload.doc.data()
        })))
      ).subscribe({
        next: (resp: any) => {
          this.documentos = resp;
   
          this.loading = false;
          sub.unsubscribe();
        }
      });
  }

  // Abrir el documento en una nueva pestaña
  abrirDocumento(url: string) {
    window.open(url, '_blank'); // Abre el documento en una nueva pestaña
  }

  // Descargar el documento desde Firebase Storage
  descargarDocumento(url: string) {
    const a = document.createElement('a');
    a.href = url;
    a.download = url.split('/').pop() || 'documento';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  async addUpdateDocument(documento?: Document) {
    let modal = await this.utilsService.getModal({
      component: UpdateDocumentComponent,
      cssClass: 'add-update-modal',
      componentProps: { documento, title: documento ? 'Actualizar Documento' : 'Agregar Documento' }
    });

    if(modal){
      this.getDocument();
    }
  }

  async deleteDocument(documento: any) {
    console.log('Listo para eliminar');
    
    const firestorePath = `users/${this.user().uid}/documents/${documento.uidDoc}`; // Ruta en Firestore
    const archivoUrl = documento.archivo; // URL del archivo en Storage
  
    const loading = await this.utilsService.loading();
    await loading.present();
  
    try {
      // 1. Eliminar el archivo en Firebase Storage (si existe)
      if (archivoUrl) {
        const storagePath = await this.firebaseService.getFilePath(archivoUrl); // Obtener la ruta del archivo en Storage
        await this.firebaseService.deleteFile(storagePath); // Eliminar el archivo
      }
  
      // 2. Eliminar el documento en Firestore
      await this.firebaseService.deleteDocument(firestorePath);

      //actualizar la lista de documentos
      this.documentos = this.documentos.filter((doc: Document) => doc.uidDoc !== documento.uidDoc);


  
      // 3. Notificación de éxito
      this.utilsService.presentToast({
        message: 'Documento eliminado correctamente',
        duration: 2000,
        color: 'success',
        position: 'bottom',
        icon: 'trash-outline',
      });
  
    } catch (error) {
      console.error('Error al eliminar documento:', error);
      this.utilsService.presentToast({
        message: 'Error al eliminar el documento',
        duration: 2000,
        color: 'danger',
        position: 'bottom',
        icon: 'alert-circle-outline',
      });
  
    } finally {
      loading.dismiss(); // Cerrar el indicador de carga
    }
  }

  doRefresh(event: any){
    setTimeout(() => {
      this.getDocument();
      event.target.complete();
    },1000)
  }
}

