import { Component, inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/pages/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { doc } from '@angular/fire/firestore';

@Component({
  selector: 'app-update-document',
  templateUrl: './update-document.component.html',
  styleUrls: ['./update-document.component.scss'],
})
export class UpdateDocumentComponent  implements OnInit {

  utilsService = inject(UtilsService);
  firebaseService = inject(FirebaseService);

  @Input() title: string;

  selectedFile: File | null = null; // Archivo seleccionado
  
  user= {} as User

  form = new FormGroup({
    uidDoc: new FormControl(''),
    uidEmployee: new FormControl(''),
    descripcion: new FormControl('', [Validators.required, Validators.minLength(6)]),
    tipo: new FormControl('', [Validators.required]),
    estado: new FormControl(''),
    fecha: new FormControl('', [Validators.required]),
    archivo: new FormControl('')
  })

  ngOnInit() {
    this.form.controls.uidEmployee.setValue(this.utilsService.getLocalStorage('user').uid); 
    this.user = this.utilsService.getLocalStorage('user');
  }

  

  dismissModal(){
    this.utilsService.dismissModal();
  }

    // Calcular el estado basado en la fecha de vencimiento
  calculateEstado(): void {
    const fechaVencimiento = new Date(this.form.controls.fecha.value);
    const hoy = new Date();
    const diferenciaDias = Math.ceil((fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  
    let estado = 'Vigente'; // Estado predeterminado
  
    if (diferenciaDias < 0) {
      estado = 'Vencido';
    } else if (diferenciaDias < 60) {
      estado = 'Por vencer';
    }
  
    this.form.controls.estado.setValue(estado); // Actualizamos el campo estado
}
  

  async createDocument(){

    let path  = `users/${this.user.uid}/documents`;

    const loading = await this.utilsService.loading();
    await loading.present();

    // let dataUrl = this.form.value.archivo;
    // let docPath = `${this.user.uid}/${Date.now()}`;
    // let archivoUrl = await this.firebaseService.updateImg(docPath, dataUrl);

    delete this.form.value.uidDoc;
    this.firebaseService.addDocument(path, this.form.value)
      .then(async resp => {
        this.utilsService.dismissModal({ success: true });
        this.utilsService.presentToast({
          message: `Documento creado correctamente`,
          duration: 2000,
          color: 'success',
          position: 'bottom',
          icon: 'document-outline'
        });

      }).catch(error => {
        console.error('Error', error);
        this.utilsService.presentToast({
          message: 'Error al iniciar sesión',
          duration: 2000,
          color: 'danger',
          position: 'bottom',
          icon: 'alert-circle-outline'
        });
      }).finally(() => {
        loading.dismiss();
      })

  }

  // Manejar la selección del archivo
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  // Subir archivo a Firebase Storage y obtener la URL
  async uploadDocument(uidEmployee: string): Promise<string> {
    if (!this.selectedFile) throw new Error('No se ha seleccionado un archivo.');

    const filePath = `${uidEmployee}/documents/${this.selectedFile.name}`; // Ruta del archivo

    // Convertimos el archivo a un data_url
    const dataUrl = await this.fileToDataUrl(this.selectedFile);

    // Usamos la función de tu servicio para subir el archivo y obtener la URL
    return this.firebaseService.updateImg(filePath, dataUrl);
  }

  // Convertir archivo a data_url para subirlo
  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async submit(){
    this.calculateEstado();
    this.uploadDocument(this.form.value.uidEmployee);
    this.createDocument();
    // if(this.form.valid){
    //   const loading = await this.utilsService.loading();

    //   await loading.present();

    //   // this.firebaseService.signIn(this.form.value as User)
    //   //   .then(resp => {
    //   //     this.getUserInfo(resp.user.uid);
    //   //   }).catch(error => {
    //   //     console.error('Error', error);
    //   //     this.utilsService.presentToast({
    //   //       message: 'Error al iniciar sesión',
    //   //       duration: 2000,
    //   //       color: 'danger',
    //   //       position: 'bottom',
    //   //       icon: 'alert-circle-outline'
    //   //     });
    //   //   }).finally(() => {
    //   //     loading.dismiss();
    //   //   })
    // }
    
  }



}
