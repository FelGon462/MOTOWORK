import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController, ToastOptions } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  router = inject(Router);
  toastCtrl = inject(ToastController);
  loadingCtrl = inject(LoadingController)

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
}
