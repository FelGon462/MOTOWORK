import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {

  backButton: string = '/auth';

  firebaseService = inject(FirebaseService);
  utilsService = inject(UtilsService);
  router = inject(Router);

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  })

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

      this.firebaseService.sendRecoveyEmail(this.form.value.email)
        .then(resp => {
          this.utilsService.presentToast({
            message: 'Correo enviado',
            duration: 2000,
            color: 'success',
            position: 'bottom',
            icon: 'mail-outline'
          });
          this.utilsService.routerlink('/auth');
          this.form.reset();
        }).catch(error => {
          console.error('Error', error);
          this.utilsService.presentToast({
            message: 'Error al enviar correo',
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
