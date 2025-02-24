import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemCategoryEditComponent } from './item-category-edit.component';

describe('ItemCategoryEditComponent', () => {
  let component: ItemCategoryEditComponent;
  let fixture: ComponentFixture<ItemCategoryEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemCategoryEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemCategoryEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
