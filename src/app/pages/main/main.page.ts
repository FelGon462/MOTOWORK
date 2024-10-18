import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit {

  router = inject(Router);
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

}
