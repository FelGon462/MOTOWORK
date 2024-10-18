import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-documento',
  templateUrl: './documento.page.html',
  styleUrls: ['./documento.page.scss'],
})
export class DocumentoPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  agregar(){
    console.log('Agregando documento');
  }

  descargar(){
    console.log('Descargando documento');
  }

  update(){
    console.log('Actualizando documento');
  }

  delete(){
    console.log('Eliminando documento');
  }

}
