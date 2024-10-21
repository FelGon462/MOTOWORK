import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage implements OnInit {

  firebaseService = inject(FirebaseService);
  utilsService = inject(UtilsService);

  backButton: string = '/auth';

  form = new FormGroup({
    uid: new FormControl(''),
    img: new FormControl(''),
    name: new FormControl('', [Validators.required, Validators.minLength(6)]),
    rol: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  })

  constructor(private router: Router) { }

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Si el usuario llegó directamente, mantener la ruta por defecto
        if (this.router.url === '/auth') {
          this.backButton = '/auth';
        }
      }
    });
  }

  async submit(){
    if(this.form.valid){
      const loading = await this.utilsService.loading();

      await loading.present();

      this.firebaseService.signUp(this.form.value as User)
        .then(async resp => {
          await this.firebaseService.updateUser(this.form.value.name && this.form.value.rol);
          
          let uid = resp.user.uid;
          this.form.controls.uid.setValue(uid);
          //funcion del seteo
          this.setUserInfo(uid);

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
    
  }

  async setUserInfo(uid: string){
    if(this.form.valid){
      const loading = await this.utilsService.loading();

      await loading.present();

      let path= `users/${uid}`;
      delete this.form.value.password;
      this.firebaseService.setDcument(path, this.form.value)
        .then(async resp => {
          this.utilsService.saveLocalStorage('user', this.form.value);
          this.utilsService.routerlink('/main/dashboard');
          this.form.reset();

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
  }

  async takeImage() {
    const dataUrl = (await this.utilsService.takePicture('Imagen del Perfil')).dataUrl;
    this.form.controls.img.setValue(dataUrl);
  }


}
