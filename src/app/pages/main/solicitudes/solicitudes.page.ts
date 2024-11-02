import { Component, inject, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { UpdateSolicitudComponent } from 'src/app/shared/components/update-solicitud/update-solicitud.component';
import { User } from '../../models/user.model';
import { Solicitud } from '../../models/solicitudes.model';
import { map } from 'rxjs/operators';

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

  user(): User {
    return this.utilsService.getLocalStorage('user');
  }

  confirmDeleteDocument(solicitud?: any) {
    console.log('Solicitud eliminada');
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

    let sub = this.firebaseService.getCollectionData(path)
      .snapshotChanges()
      .pipe(
        map(changes => changes.map(c => ({
          id: c.payload.doc.id,
          ...c.payload.doc.data()
        })))
      ).subscribe({
        next: (resp: any) => {
          this.solicitudes = resp;
   
          this.loading = false;
          sub.unsubscribe();
        }
      });
  }

}
