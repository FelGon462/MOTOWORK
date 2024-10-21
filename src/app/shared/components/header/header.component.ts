import { Component, inject, Input, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent  implements OnInit {

  @Input() title!: string;
  @Input() showMenu!: boolean;
  @Input() backButton!: string;
  @Input() isModal!: boolean;
  
  menuCtrl = inject(MenuController);
  utilsService = inject(UtilsService);
  ngOnInit() {
    
  }

  dismissModal(){
    this.utilsService.dismissModal();
  }

  toggleMenu() {
    if (this.showMenu) {
      this.menuCtrl.open('first');  // Asegúrate de que 'first' coincida con el menuId
    } else {
      this.menuCtrl.close();
    }
  }
}
