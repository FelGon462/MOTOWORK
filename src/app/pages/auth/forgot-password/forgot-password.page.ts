import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {

  backButton: string = '/auth';

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
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

  submit(){
    if(this.form.valid){
      console.log(this.form.value);
    }
    
  }

}
