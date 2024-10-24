import { Component, inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/pages/models/user.model';
import { Document } from 'src/app/pages/models/document.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { updateDoc } from '@angular/fire/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Asegúrate de tener estas importaciones


@Component({
  selector: 'app-update-document',
  templateUrl: './update-document.component.html',
  styleUrls: ['./update-document.component.scss'],
})
export class UpdateDocumentComponent implements OnInit {

  @Input() documento: Document;

  utilsService = inject(UtilsService);
  firebaseService = inject(FirebaseService);

  @Input() title: string;
  uploadInProgress: boolean = false;
  selectedFile: File | null = null;
  user = {} as User;

  form = new FormGroup({
    uidDoc: new FormControl(''),
    uidEmployee: new FormControl('', Validators.required),
    descripcion: new FormControl('', [Validators.required, Validators.minLength(6)]),
    tipo: new FormControl('', [Validators.required]),
    estado: new FormControl(''),
    fecha: new FormControl(new Date(), [Validators.required]),
    archivo: new FormControl(''), // Guardar la URL del archivo
  });

  ngOnInit() {
    const user = this.utilsService.getLocalStorage('user');
    this.user = user;
    this.form.controls.uidEmployee.setValue(user.uid);
    if(this.documento) {
      this.form.patchValue(this.documento);
      // Si hay un archivo existente, lo referenciamos.
      if (this.documento.archivo) {
        console.log('Archivo encontrado:', this.documento.archivo);
        this.form.controls.archivo.setValue(this.documento.archivo);
      }
    }
  }

  //para convertir a numero un dato en firebase
  // setNumberInput() {
  //   let { uidDoc } = this.form.controls;
  //   if (uidDoc.value) {
  //     uidDoc.setValue(parseFloat(uidDoc.value));  // Convertir a número
  //   }
  // }

  // Manejar la selección del archivo
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  // Subir archivo a Firebase Storage y obtener la URL
async uploadDocument(uid: string): Promise<string> {
  const archivoPath = `users/${uid}/documents/${Date.now()}_${this.selectedFile.name}`;
  const archivoRef = ref(getStorage(), archivoPath);

  // Subimos el archivo a Storage
  const uploadTask = await uploadBytes(archivoRef, this.selectedFile);

  // Obtenemos la URL del archivo subido
  const archivoUrl = await getDownloadURL(uploadTask.ref);
  return archivoUrl; // Retornamos la URL del archivo
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
    const path = `users/${this.user.uid}/documents`; // Ruta de la colección
  
    const loading = await this.utilsService.loading();
    await loading.present();
  
    try {
      let archivoUrl = '';
  
      // Subimos el archivo solo si se seleccionó uno
      if (this.selectedFile) {
        archivoUrl = await this.uploadDocument(this.user.uid); // Subir solo una vez
        this.form.controls.archivo.setValue(archivoUrl);
      }
  
      // Generamos un UID para el documento
      const uidDoc = this.firebaseService.createId();
      this.form.controls.uidDoc.setValue(uidDoc);
  
      // Creamos la estructura del documento con el archivo subido
      const docData = { ...this.form.value, uidDoc };
  
      // Guardamos el documento en Firestore
      await this.firebaseService.setDcument(`${path}/${uidDoc}`, docData);
  
      // Notificación de éxito
      this.utilsService.dismissModal({ success: true });
      this.utilsService.presentToast({
        message: 'Documento creado correctamente',
        duration: 2000,
        color: 'success',
        position: 'bottom',
        icon: 'document-outline',
      });
  
      // Limpiamos el formulario y el archivo seleccionado
      this.form.reset();
      this.selectedFile = null;
  
    } catch (error) {
      console.error('Error al crear documento:', error);
      this.utilsService.presentToast({
        message: 'Error al crear el documento',
        duration: 2000,
        color: 'danger',
        position: 'bottom',
        icon: 'alert-circle-outline',
      });
  
    } finally {
      loading.dismiss(); // Cerramos el indicador de carga
    }
  }
  



  // Calcular el estado del documento según la fecha de vencimiento
  calculateEstado(): void {
    const fechaVencimiento = new Date(this.form.controls.fecha.value);
    const hoy = new Date();
    const diferenciaDias = Math.ceil((fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

    let estado = 'Vigente';
    if (diferenciaDias < 0) {
      estado = 'Vencido';
    } else if (diferenciaDias < 60) {
      estado = 'Por vencer';
    }

    this.form.controls.estado.setValue(estado); // Actualizamos el estado
  }

  // Enviar el formulario
  async submit() {
    if(this.form.valid) {
      if(this.documento) {
        this.updateDocument();
      } else {
        this.calculateEstado(); // Calculamos el estado del documento
  
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
    const path = `users/${this.user.uid}/documents/${this.documento.uidDoc}`; // Ruta del documento
  
    const loading = await this.utilsService.loading();
    await loading.present();
  
    try {
      // Si el archivo ha cambiado, subimos el nuevo archivo
      if (this.selectedFile) {
        const dataUrl = await this.fileToDataUrl(this.selectedFile); // Convertimos archivo a dataURL
        const archivoPath = `users/${this.user.uid}/documents/${Date.now()}_${this.selectedFile.name}`; // Nueva ruta
        const archivoUrl = await this.firebaseService.updateImg(archivoPath, dataUrl); // Subimos el archivo
  
        this.form.controls.archivo.setValue(archivoUrl); // Actualizamos la URL del archivo
      }
  
      // Creamos la estructura del documento que se va a actualizar
      const docData = { ...this.form.value, uidDoc: this.documento.uidDoc };
  
      // Actualizamos el documento en Firestore
      await this.firebaseService.updateDocument(path, docData);
  
      // Notificación de éxito
      this.utilsService.dismissModal({ success: true });
      this.utilsService.presentToast({
        message: 'Documento actualizado correctamente',
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
        message: 'Error al actualizar el documento',
        duration: 2000,
        color: 'danger',
        position: 'bottom',
        icon: 'alert-circle-outline',
      });
    } finally {
      loading.dismiss();
    }
  }

  // Cerrar el modal
  dismissModal() {
    this.utilsService.dismissModal();
  }
  
}


