import { Component, inject, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  firebaseService = inject(FirebaseService);
  utilsService = inject(UtilsService);

  constructor() { }

  ngOnInit() {
  }

  user(): User{
    return this.utilsService.getLocalStorage('user');
  }

  async takeImage() {

    let user = this.user();

    let path = `users/${user.uid}`;

    const dataUrl = (await this.utilsService.takePicture('Imagen del Perfil')).dataUrl; //extrraer la respuesta
    // this.utils.setLocalStorage('user', {image: dataUrl}); //guardar la imagen en el localstorage
    const loading = await this.utilsService.loading();

    await loading.present();

    let imgPath = `${user.uid}/${user.name}.jpg`;
    user.img = await this.firebaseService.updateImg(imgPath, dataUrl);
    this.firebaseService.updateDocument(path, {img: user.img})
      .then(async resp => {
        this.utilsService.saveLocalStorage('user', user);
        this.utilsService.presentToast({
          message: `Imagen Actualizada correctamente`,
          duration: 1500,
          color: 'primary',
          position: 'bottom',
          icon: 'checkmark-circle-outline'
        })
      }).catch(error => {
          console.error('Error during sign-in:', error);
          this.utilsService.presentToast({
          message: error.message,
          duration: 2500,
          color: 'danger',
          position: 'bottom',
          icon: 'alert-circle-outline'
        })
        loading.dismiss();
      }).finally(() => {
        loading.dismiss();
    })

  }

}
