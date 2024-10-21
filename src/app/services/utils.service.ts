import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ModalController, ModalOptions, ToastController, ToastOptions } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  router = inject(Router);
  toastCtrl = inject(ToastController);
  loadingCtrl = inject(LoadingController);
  modalCtrl = inject(ModalController);

  loading(){
    return this.loadingCtrl.create({ spinner: 'crescent'})
  }

  routerlink(url: any){
    this.router.navigateByUrl(url)
  }

  async presentToast(opts?: ToastOptions){
    const toast = await this.toastCtrl.create(opts);
    toast.present();

  }

  saveLocalStorage(key: string, value: any){
    return localStorage.setItem(key, JSON.stringify(value));
  }

  getLocalStorage(key: string){
    return JSON.parse(localStorage.getItem(key));
  }

  async getModal(opts: ModalOptions){
    const modal = await this.modalCtrl.create(opts);
    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data){
      return data;
    }
  }

  dismissModal(data?: any){
    this.modalCtrl.dismiss(data);
  }

  async takePicture(promptLabelHeader: string){
    return await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt, // opcion a elegir entre tomar foto o seleccionar de galeria
      promptLabelHeader,
      promptLabelPhoto: 'Seleciona una foto',
      promptLabelPicture: 'Tomar una foto',
    });

  };

}
