import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Category } from '../models/category';
import { Slot } from '../models/slot';
import { BeltDataService } from '../services/belt-data.service';
import { MasterDataService } from '../services/master-data.service';

interface SubCategoryOption {
  subCategory: number;
  name: string;
}

// すごさ用のインデックスと名前の対応
interface AttributeOption {
  attribute: number;
  name: string;
}

@Component({
  selector: 'app-belt-add',
  templateUrl: './belt-add.component.html',
  styleUrls: ['./belt-add.component.scss']
})
export class BeltAddComponent implements OnInit {

  keyTime: string|null = null;
  beltType = 0;
  showParam = true;
  currentSlot = 0;
  currentField = 0;   // 0: category, 1: subcategory, 2: attribute

  slots: Slot[] = [
    {category: undefined, subCategory: undefined, attribute: undefined, },
    {category: undefined, subCategory: undefined, attribute: undefined, },
    {category: undefined, subCategory: undefined, attribute: undefined, },
    {category: undefined, subCategory: undefined, attribute: undefined, },
    {category: undefined, subCategory: undefined, attribute: undefined, },
  ];

  constructor(
    public masterDataService: MasterDataService,
    private beltDataService: BeltDataService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    const id: string|null = this.activatedRoute.snapshot.params.id;
    if (id != null) {
      this.keyTime = id;
      const belt = this.beltDataService.getCopyOfBelt(this.keyTime);
      if (belt != null) {
        this.beltType = belt.beltType;
        this.slots = belt.slots;
      } else {
        this.router.navigate(['/']);
      }
    }
  }

  setBeltSwitch(beltType: number): void {
    for (let i = 0; i < 5; i++) {
     this.slots[i].category = undefined;
     this.slots[i].subCategory = undefined;
     this.slots[i].attribute = undefined;
    }
    this.currentSlot = 0;
    this.currentField = 0;
    this.beltType = beltType;
  }

  setCurrentSlot(idx: number, field: number): void {
    this.currentSlot = idx;
    this.currentField = field;
  }

  getCurrentSlot(): Slot {
    return this.slots[this.currentSlot];
  }

  isCompleted(): boolean {
    let completeCnt = 0;
    for (let i = 0; i < 5; i++){
      if (this.slots[i].category != null){
        if (this.slots[i].attribute != null){
          completeCnt++;
        } else {
          return false;
        }
      }
    }
    if (completeCnt > 0){
      return true;
    } else {
      return false;
    }
  }
  onClickComplete(): void {
    if (this.keyTime == null) {
      const keyTime =  new Date().getTime().toString();
      this.beltDataService.addBelt(keyTime, this.beltType, this.slots);
    } else {
      this.beltDataService.replaceBelt(this.keyTime, this.beltType, this.slots);
    }

    this.router.navigate(['/']);
  }

  getSlotCategoryName(slot: Slot): string {
    if (slot.category == null) {
      return '';
    }
    const category = this.masterDataService.getCategory(slot.category);
    return category.label;
  }

  shouldShowSubCategory(slot: Slot): boolean {
    if (slot.category == null) {
      return false;
    }
    const category = this.masterDataService.getCategory(slot.category);
    return (category.subCategoryOptions != null);
  }

  getSlotSubCategory(slot: Slot): string {
    if (slot.category == null || slot.subCategory == null) {
      return '';
    }
    const category = this.masterDataService.getCategory(slot.category);
    if (category.subCategoryOptions == null) {
      return '';
    }
    return category.subCategoryOptions[slot.subCategory];
  }

  shouldShowAttribute(slot: Slot): boolean {
    if (slot.category == null) {
      return false;
    }
    const category = this.masterDataService.getCategory(slot.category);
    return (category.subCategoryOptions == null || slot.subCategory != null);
  }

  getSlotAttribute(slot: Slot): string {
    if (slot.category == null || slot.attribute == null) {
      return '';
    }
    const category = this.masterDataService.getCategory(slot.category);
    return category.attributeOptions[slot.attribute];
  }

  getSlotSubCategoryOptions(slot: Slot): SubCategoryOption[] {
    if (slot.category == null) {
      return [];
    }
    const category = this.masterDataService.getCategory(slot.category);
    const subCategoryOptions: SubCategoryOption[] = [];
    if (category.subCategoryOptions != null){
      for (let idx = 0; idx < category.subCategoryOptions.length; ++idx) {
        subCategoryOptions.push(
          {
            subCategory: idx,
            name: category.subCategoryOptions[idx],
          }
        );
      }
    }
    return subCategoryOptions;
  }

  getSlotAttributeOptions(slot: Slot): AttributeOption[] {
    if (slot.category == null) {
      return [];
    }
    const category = this.masterDataService.getCategory(slot.category);
    const attributeOptions: AttributeOption[] = [];
    for (let idx = 0; idx < category.attributeOptions.length; ++idx) {
      // 並び順を逆にする
      attributeOptions.unshift(
        {
          attribute: idx,
          name: category.attributeOptions[idx],
        }
      );
    }
    return attributeOptions;
  }

  onClickCategory(category: Category): void {
    if (this.currentSlot < 0 || this.currentSlot > this.slots.length) {
      return;
    }
    this.currentField = (category.subCategoryOptions != null) ? 1 : 2;
    if (this.slots[this.currentSlot].category === category.categoryId) {
      // 現在の選択と変わらず
      return;
    }
    this.slots[this.currentSlot].category = category.categoryId;
    this.slots[this.currentSlot].subCategory = undefined;
    this.slots[this.currentSlot].attribute = undefined;
  }

  onClickSubCategory(subCategory: SubCategoryOption): void {
    this.slots[this.currentSlot].subCategory = subCategory.subCategory;
    this.currentField = 2;
  }

  onClickAttribute(attribute: AttributeOption): void {
    this.slots[this.currentSlot].attribute = attribute.attribute;
    this.currentSlot = this.currentSlot + 1;
    this.currentField = 0;
  }
}

