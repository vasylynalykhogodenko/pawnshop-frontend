import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemCategoryAddComponent } from './item-category-add.component';

describe('ItemCategoryAddComponent', () => {
  let component: ItemCategoryAddComponent;
  let fixture: ComponentFixture<ItemCategoryAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemCategoryAddComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemCategoryAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
