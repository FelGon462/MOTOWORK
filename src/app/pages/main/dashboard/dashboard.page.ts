import { Component, inject, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { map } from 'rxjs/operators';
import { AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Document } from '../../models/document.model';
import { User } from '../../models/user.model';
import { UtilsService } from '../../../services/utils.service';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  documentCount = 0;
  solicitudCount = 0;
  vencidoCount = 0;
  porVencerCount = 0;
  turnoCount = 0;
  loading = true;

  firebaseService = inject(FirebaseService);
  utilsService = inject(UtilsService);

  ngOnInit() {
    
  }

  ionViewWillEnter(){
    this.getDocumentCount();
    this.getSolicitudCount();
    this.getTurnoCount();
  }


   // Para obtener el conteo de documentos
   getDocumentCount() {
    const path = `users/${this.user().uid}/documents`;
  
    this.firebaseService.firestore.collection(path).get().subscribe({
      next: (querySnapshot) => {
        const documentos = querySnapshot.docs.map(doc => doc.data() as Document);
        
        // Filtrar y contar documentos por estado
        this.vencidoCount = documentos.filter(doc => doc.estado === 'Vencido').length;
        this.porVencerCount = documentos.filter(doc => doc.estado === 'Por vencer').length;
  
        this.loading = false;
        console.log(`Documentos vencidos: ${this.vencidoCount}, Documentos por vencer: ${this.porVencerCount}`);
      },
      error: (error) => {
        console.error('Error al obtener documentos:', error);
      },
      complete: () => console.log('Conteo de documentos completado.')
    });
  }
  

  // Para obtener el conteo de solicitudes
  getSolicitudCount() {
    const path = `users/${this.user().uid}/solicitudes`;
    this.firebaseService.getCollectionData(path)
      .snapshotChanges()
      .subscribe({
        next: (resp: any) => {
          this.solicitudCount = resp.length;
          this.loading = false;
          console.log('Solicitudes:', this.solicitudCount);
        },
        error: (error) => {
          console.error('Error al obtener el recuento de solicitudes:', error);
        },
        complete: () => console.log('Conteo de solicitudes completado.')
      });
  }
  

  // Para obtener el conteo de turnos
  getTurnoCount() {
    const path = `users/${this.user().uid}/turnos`;
    this.firebaseService.getCollectionData(path)
      .snapshotChanges()
      .subscribe((resp: any) => {
        this.turnoCount = resp.length;
        this.loading = false;
        console.log('Turnos:', this.turnoCount);
      });
  }



  user(): User{
    return this.utilsService.getLocalStorage('user');
  }

}
