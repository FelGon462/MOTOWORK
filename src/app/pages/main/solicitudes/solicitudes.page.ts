import { Component, inject, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { UpdateSolicitudComponent } from 'src/app/shared/components/update-solicitud/update-solicitud.component';
import { User } from '../../models/user.model';
import { Solicitud } from '../../models/solicitudes.model';
import { map } from 'rxjs/operators';
import { getDocs, collection } from 'firebase/firestore'; // Importa getDocs y collection si usas Firebase Modular

@Component({
  selector: 'app-solicitudes',
  templateUrl: './solicitudes.page.html',
  styleUrls: ['./solicitudes.page.scss'],
})
export class SolicitudesPage implements OnInit {

  firebaseService = inject(FirebaseService);
  utilsService = inject(UtilsService);

  loading: boolean = false;
  solicitudes: Solicitud[] = [];

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.getDocument();
  }

  user(): User {
    return this.utilsService.getLocalStorage('user');
  }

  async addUpdateDocument(solicitud?: Solicitud) {
    let modal = await this.utilsService.getModal({
      component: UpdateSolicitudComponent,
      cssClass: 'add-update-modal',
      componentProps: { solicitud, title: solicitud ? 'Actualizar Solicitud' : 'Agregar Solicitud' }
    });

    if(modal){
      this.getDocument();
    }
  }

  getDocument() {
    const path = `users/${this.user().uid}/solicitudes`;
    this.loading = true;
  
    const solicitudesRef = this.firebaseService.firestore.collection(path); 
  
    solicitudesRef.get().subscribe({
      next: (querySnapshot) => {
        this.solicitudes = querySnapshot.docs.map(doc => {
          const data = doc.data() as Partial<Solicitud>; // Convertimos data a Partial<Solicitud> para evitar errores de propiedades faltantes.
          return {
            id: doc.id,
            uidSolicitud: data.uidSolicitud ?? '', // Asignamos un valor predeterminado si falta alguna propiedad
            uidEmployee: data.uidEmployee ?? '',
            descripcion: data.descripcion ?? '',
            fechaInicio: data.fechaInicio ?? '',
            fechaFin: data.fechaFin ?? '',
            fechaSolicitud: data.fechaSolicitud ?? '',
            tramo: data.tramo ?? '',
            estado: data.estado ?? '',
            archivo: data.archivo ?? ''
          } as Solicitud;
        });
        console.log('Datos obtenidos:', this.solicitudes);
        this.loading = false;
      },
      error: (error) => {
        console.error("Error obteniendo documentos: ", error);
        this.loading = false;
      }
    });
  }
  
  
  

  async deleteDocument(solicitud: any) {
  
    const firestorePath = `users/${this.user().uid}/solicitudes/${solicitud.uidSolicitud}`; // Ruta en Firestore
    const archivoUrl = solicitud.archivo; // URL del archivo en Storage
  
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
      this.solicitudes = this.solicitudes.filter((doc: Solicitud) => doc.uidSolicitud !== solicitud.uidSolicitud);


  
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

  async confirmDeleteDocument(documento: Solicitud) {
    this.utilsService.presentAlert({
      header: 'Eliminar Documento',
      message: '¿Estás seguro de que deseas eliminar este documento?',
      mode: 'ios',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Eliminar',
          cssClass: 'danger',
          handler: () => this.deleteDocument(documento),
        },  
      ],
    })  
  }

  doRefresh(event: any){
    setTimeout(() => {
      this.getDocument();
      event.target.complete();
    },1000)
  }

}
