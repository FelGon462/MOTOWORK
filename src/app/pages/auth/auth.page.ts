import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FirebaseService } from 'src/app/services/firebase.service';
import { User } from '../models/user.model';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {

  firebaseService = inject(FirebaseService);
  utilsService = inject(UtilsService);


  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  })
  constructor() { }

  ngOnInit() {
  }

  async submit(){
    if(this.form.valid){
      const loading = await this.utilsService.loading();

      await loading.present();

      this.firebaseService.signIn(this.form.value as User)
        .then(resp => {
          this.getUserInfo(resp.user.uid);
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

  async getUserInfo(uid: string){
    if(this.form.valid){
      const loading = await this.utilsService.loading();

      await loading.present();

      let path= `users/${uid}`;
      
      this.firebaseService.getDocument(path)
        .then((user: User) => {
          this.utilsService.saveLocalStorage('user', user);
          this.utilsService.routerlink('/main/dashboard');
          this.form.reset();

          this.utilsService.presentToast({
            message: `Bienvenido ${user.name}`,
            duration: 2000,
            color: 'success',
            position: 'bottom',
            icon: 'person-circle-outline'
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
  }

}
