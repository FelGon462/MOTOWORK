import { Component, Input, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent  implements OnInit {

  @Input() title!: string;
  @Input() showMenu!: boolean;
  @Input() backButton!: string;
  
  constructor(private menuCtrl: MenuController) {}
  ngOnInit() {
    
  }
  toggleMenu() {
    if (this.showMenu) {
      this.menuCtrl.open('first');  // Asegúrate de que 'first' coincida con el menuId
    } else {
      this.menuCtrl.close();
    }
  }
}
