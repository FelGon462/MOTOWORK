import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResumenMensualPage } from './resumen-mensual.page';

describe('ResumenMensualPage', () => {
  let component: ResumenMensualPage;
  let fixture: ComponentFixture<ResumenMensualPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ResumenMensualPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
