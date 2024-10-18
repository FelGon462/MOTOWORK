import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TurnoPage } from './turno.page';

describe('TurnoPage', () => {
  let component: TurnoPage;
  let fixture: ComponentFixture<TurnoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TurnoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
