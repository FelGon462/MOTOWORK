import { ChangeDetectorRef, Component, inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Solicitud } from 'src/app/pages/models/solicitudes.model';
import { User } from 'src/app/pages/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';  // Ajuste: usando uploadBytesResumable

@Component({
  selector: 'app-update-solicitud',
  templateUrl: './update-solicitud.component.html',
  styleUrls: ['./update-solicitud.component.scss'],
})
export class UpdateSolicitudComponent  implements OnInit {

  user = {} as User;

  utilsService = inject(UtilsService);
  firebaseService = inject(FirebaseService);
  changeDetector = inject(ChangeDetectorRef);

  @Input() title: string;
  @Input() solicitud: Solicitud;

  uploadInProgress: boolean = false;
  selectedFile: File | null = null;
  uploadProgress: number = 0;  // Progreso de la subida

  form = new FormGroup({
    uidSolicitud: new FormControl(''),
    uidEmployee: new FormControl('', Validators.required),
    descripcion: new FormControl('', [Validators.required, Validators.minLength(6)]),
    fechaInicio: new FormControl(new Date(), [Validators.required]),
    fechaFin: new FormControl(new Date(), [Validators.required]),
    tramo: new FormControl(''),
    estado: new FormControl(''),
    fechaSolicitud: new FormControl(new Date(), [Validators.required]),
    archivo: new FormControl(''), // Guardar la URL del archivo
  });

  ngOnInit() {
    const user = this.utilsService.getLocalStorage('user');
    this.user = user;
    this.form.controls.uidEmployee.setValue(user.uid);
    if (this.solicitud) {
      this.form.patchValue(this.solicitud);
      if (this.solicitud.archivo) {
        this.form.controls.archivo.setValue(this.solicitud.archivo);
      }
    }
  }

  // Manejar la selección del archivo
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  // Subir archivo con seguimiento del progreso
  async uploadDocument(uid: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const archivoPath = `users/${uid}/solicitudes/${Date.now()}_${this.selectedFile.name}`;
      const archivoRef = ref(getStorage(), archivoPath);
      const uploadTask = uploadBytesResumable(archivoRef, this.selectedFile);
      this.uploadInProgress = true; // Mostrar barra de progreso

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          this.uploadProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Progreso: ${this.uploadProgress}%`);
          this.changeDetector.detectChanges(); // Forzar actualización de la vista
        },
        (error) => {
          console.error('Error al subir archivo:', error);
          this.uploadInProgress = false;
          this.uploadProgress = 0;
          this.changeDetector.detectChanges();
          reject(error);
        },
        async () => {
          const archivoUrl = await getDownloadURL(uploadTask.snapshot.ref);
          console.log('Archivo subido correctamente:', archivoUrl);
          resolve(archivoUrl);
        }
      );
    });
  }

  // Enviar el formulario
  async submit() {
    if(this.form.valid) {
      if(this.solicitud) {
        this.updateDocument();
      } else {
        this.form.controls.estado.setValue('solicitado');
  
        let archivoUrl = this.form.controls.archivo.value; // URL del archivo actual
  
        // Si el usuario seleccionó un nuevo archivo, lo subimos
        if (this.selectedFile) {
          archivoUrl = await this.uploadDocument(this.user.uid); // Subimos el nuevo archivo
        }
        // Guardamos la nueva URL en el formulario
        this.form.controls.archivo.setValue(archivoUrl);
         // Llamamos al método para crear o actualizar el documento
        await this.createDocument();
      }
    }
    
  }

  async updateDocument() {
    console.log('Listo para actualizar');
    const path = `users/${this.user.uid}/solicitudes/${this.solicitud.uidSolicitud}`; // Ruta del documento
  
    const loading = await this.utilsService.loading();
    await loading.present();
  
    try {
      // Si el archivo ha cambiado, subimos el nuevo archivo
      if (this.selectedFile) {
        const dataUrl = await this.fileToDataUrl(this.selectedFile); // Convertimos archivo a dataURL
        const archivoPath = `users/${this.user.uid}/solicitudes/${Date.now()}_${this.selectedFile.name}`; // Nueva ruta
        const archivoUrl = await this.firebaseService.updateImg(archivoPath, dataUrl); // Subimos el archivo
  
        this.form.controls.archivo.setValue(archivoUrl); // Actualizamos la URL del archivo
      }
  
      // Creamos la estructura del documento que se va a actualizar
      const docData = { ...this.form.value, uidDoc: this.solicitud.uidSolicitud };
  
      // Actualizamos el documento en Firestore
      await this.firebaseService.updateDocument(path, docData);
  
      // Notificación de éxito
      this.utilsService.dismissModal({ success: true });
      this.utilsService.presentToast({
        message: 'Solicitud actualizada correctamente',
        duration: 2000,
        color: 'success',
        position: 'bottom',
        icon: 'document-outline',
      });
  
      // Limpiar formulario y archivo seleccionado
      this.form.reset();
      this.selectedFile = null;
  
    } catch (error) {
      console.error('Error al actualizar documento:', error);
      this.utilsService.presentToast({
        message: 'Error al actualizar la solicitud',
        duration: 2000,
        color: 'danger',
        position: 'bottom',
        icon: 'alert-circle-outline',
      });
    } finally {
      loading.dismiss();
    }
  }

  // Convertir archivo a data_url
  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Crear documento en Firestore
  async createDocument() {
    const path = `users/${this.user.uid}/solicitudes`;

    const loading = await this.utilsService.loading();
    await loading.present();
    this.uploadInProgress = true; // Mostrar barra de progreso

    try {
      let archivoUrl = '';

      if (this.selectedFile) {
        this.uploadInProgress = true; // Mostrar barra de progreso
        archivoUrl = await this.uploadDocument(this.user.uid);
        this.form.controls.archivo.setValue(archivoUrl);
      }
      
      const uidDoc = this.firebaseService.createId();
      this.form.controls.uidSolicitud.setValue(uidDoc);

      const docData = { ...this.form.value, uidDoc };
      await this.firebaseService.setDcument(`${path}/${uidDoc}`, docData);

      this.utilsService.dismissModal({ success: true });
      this.utilsService.presentToast({
        message: 'Solicitud creada correctamente',
        duration: 2000,
        color: 'success',
        position: 'bottom',
        icon: 'document-outline',
      });

      this.form.reset();
      this.selectedFile = null;

    } catch (error) {
      console.error('Error al crear documento:', error);
      this.utilsService.presentToast({
        message: 'Error al crear la solicitud',
        duration: 2000,
        color: 'danger',
        position: 'bottom',
        icon: 'alert-circle-outline',
      });
    } finally {
      this.uploadInProgress = false; // Ocultamos la barra de progreso
      this.uploadProgress = 0; // Resetear progreso
      this.changeDetector.detectChanges(); // Forzamos actualización de la interfaz
      loading.dismiss();
    }
  }

  // Cerrar el modal
  dismissModal() {
    this.utilsService.dismissModal();
  }

}
