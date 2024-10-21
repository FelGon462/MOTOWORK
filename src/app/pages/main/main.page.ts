import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { signOut } from 'firebase/auth';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit {

  router = inject(Router);
  firebaseService = inject(FirebaseService);
  utilsService = inject(UtilsService);
  currentPath: string = '';

  pages = [
    {
      title: 'Dashboard',
      url: '/main/dashboard',
      icon: 'home'
    },
    {
      title: 'Documento',
      url: '/main/documento',
      icon: 'document'
    },
    {
      title: 'Turno',
      url: '/main/turno',
      icon: 'time'
    }
  ];

  pages2 = [
    {
      title: 'Mi Info',
      url: '/main/profile',
      icon: 'person'
    },
    {
      title: 'Resumen Mensual',
      url: '/main/resumen-mensual',
      icon: 'calendar'
    }
  ];

  ngOnInit() {
    this.router.events.subscribe((event: any) => {
      if(event.url){
        this.currentPath = event.url;
      }
      
    });
  }

  signOut(){
    this.firebaseService.signOut()
  }

  user(): User{
    return this.utilsService.getLocalStorage('user');
  }

}
