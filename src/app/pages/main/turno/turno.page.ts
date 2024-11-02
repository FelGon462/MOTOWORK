import { Component, inject, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { User } from '../../models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-turno',
  templateUrl: './turno.page.html',
  styleUrls: ['./turno.page.scss'],
})
export class TurnoPage implements OnInit {
  currentDate: string = ''; 
  isRun = false; // Estado del cronómetro

  // Variables del cronómetro
  private segundosAcumulados = 0; // Total de segundos transcurridos
  public _horas: string = '00';
  public _minutos: string = '00';
  public _segundos: string = '00';

  public contador: any;

  firebaseService = inject(FirebaseService);
  utilsService = inject(UtilsService);

  form = new FormGroup({
    uidTurno: new FormControl(''),
    uidEmployee: new FormControl(''),
    img: new FormControl(''),
    descripcion: new FormControl('', [Validators.required, Validators.minLength(6)]),
    horaIngreso: new FormControl(''),
    horaSalida: new FormControl(''),
    fecha: new FormControl('', [Validators.required]),
  });

  constructor(private toastController: ToastController) {}

  ngOnInit() {
    this.setCurrentDate();
  }

  user(): User {
    return this.utilsService.getLocalStorage('user');
  }

  // Establece la fecha actual para mostrar en la vista
  setCurrentDate() {
    const days = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    const today = new Date();
    const dayName = days[today.getDay()];
    const day = today.getDate();
    const monthName = months[today.getMonth()];
    const year = today.getFullYear();

    this.currentDate = `${dayName} ${day} ${monthName} ${year}`;
  }

  // Inicia el cronómetro y acumula el tiempo transcurrido en segundos
  start() {
    this.contador = setInterval(() => {
      this.segundosAcumulados++;

      const horas = Math.floor(this.segundosAcumulados / 3600);
      const minutos = Math.floor((this.segundosAcumulados % 3600) / 60);
      const segundos = this.segundosAcumulados % 60;

      this._horas = horas < 10 ? '0' + horas : '' + horas;
      this._minutos = minutos < 10 ? '0' + minutos : '' + minutos;
      this._segundos = segundos < 10 ? '0' + segundos : '' + segundos;
    }, 1000);
  }

  // Pausa el cronómetro
  pause() {
    clearInterval(this.contador);
  }

  // Registra la hora de entrada
  registrarEntrada() {
    const now = new Date().toLocaleTimeString();
    this.form.controls.horaIngreso.setValue(now);
  
    if (!this.isRun) {
      this.isRun = true;
      this.start();
    }
  
    this.presentToast('Entrada registrada: ' + now);
  
    // Asegura que el foco no quede en un botón "inert"
    setTimeout(() => {
      const entradaButton = document.querySelector('ion-button[color="primary"]') as HTMLButtonElement;
      entradaButton?.blur();
    }, 100);
  }
  
  registrarSalida() {
    const now = new Date();
    const horaSalida = now.toLocaleTimeString();
    const fechaSalida = now.toLocaleDateString();
  
    this.form.controls.horaSalida.setValue(horaSalida);
    this.form.controls.fecha.setValue(fechaSalida);
    this.form.controls.uidEmployee.setValue(this.user().uid);
    this.form.controls.uidTurno.setValue(this.firebaseService.createId());
  
    if (this.isRun) {
      this.isRun = false;
      this.pause();
      this.resetTimer();
    }
  
    console.log('Formulario al registrar salida:', this.form.value);
    this.presentToast('Salida registrada: ' + horaSalida);
  
    // Asegura que el foco no quede en un botón "inert"
    setTimeout(() => {
      const salidaButton = document.querySelector('ion-button[color="danger"]');
      if (salidaButton instanceof HTMLElement) {
        salidaButton.blur();
      }
    }, 100);
  }
  
  // Reinicia el cronómetro y sus variables
  resetTimer() {
    clearInterval(this.contador); // Detiene el cronómetro si está corriendo
    this.segundosAcumulados = 0; // Reinicia los segundos acumulados

    // Restablece los valores visibles
    this._horas = '00';
    this._minutos = '00';
    this._segundos = '00';

    this.isRun = false; // Asegúrate de marcar que el cronómetro no está corriendo
  }


  // Muestra un toast con un mensaje
  async presentToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
      color: 'light',
    });
    toast.present();
  }

  // Captura una imagen y la guarda en el formulario
  async takeImage() {
    const dataUrl = (await this.utilsService.takePicture('Imagen de Asistencia')).dataUrl;
    this.form.controls.img.setValue(dataUrl);
  }

  // Envía los datos del formulario o los muestra en consola
  async submit() {
    this.createTurno();
    // Aquí podrías enviar los datos a Firebase
  }

  async createTurno(){

    let path = `users/${this.user().uid}/turnos`;


    const loading = await this.utilsService.loading();

    await loading.present();

    let dataUrl = this.form.value.img;
    let imgPath = `users/${this.user().uid}/turnos/${Date.now()}_turno.jpg`;
    let imgUrl = await this.firebaseService.updateImg(imgPath, dataUrl);

    this.form.controls.img.setValue(imgUrl);

    this.firebaseService.addDocument(path, this.form.value, this.form.value.uidTurno)
    .then(async resp => {
      this.utilsService.presentToast({
        message: `Turno Registrado correctamente`,
        duration: 1500,
        color: 'primary',
        position: 'bottom',
        icon: 'checkmark-circle-outline'
      })
    }).catch(error => {
        console.error('Error al registrar turno:', error);
        this.utilsService.presentToast({
        message: error.message,
        duration: 2500,
        color: 'danger',
        position: 'bottom',
        icon: 'alert-circle-outline'
      })
      loading.dismiss();
    }).finally(() => {
      this.form.reset();
      loading.dismiss();
    })
  }
}
