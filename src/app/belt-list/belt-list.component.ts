/* tslint:disable: no-string-literal */
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Belt } from '../models/belt';
import { Exportdata } from '../models/exportdata';
import { Slot } from '../models/slot';
import { BeltDataService } from '../services/belt-data.service';
import { MasterDataService } from '../services/master-data.service';

interface SearchCondition {
  cond: string;
  label: string;
}


@Component({
  selector: 'app-belt-list',
  templateUrl: './belt-list.component.html',
  styleUrls: ['./belt-list.component.scss']
})
export class BeltListComponent implements OnInit {

  constructor(
    public masterDataService: MasterDataService,
    public beltDataService: BeltDataService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) { }

  showConds = false;
  conds: { [name: string]: SearchCondition} = {};
  isShowExport = false;
  exportUrl = '';
  decodedBeltData?: Exportdata;

  @ViewChild('exportUrlElement')
  exportUrlElement?: ElementRef;

  ngOnInit(): void {
    const b64data: string|null = this.activatedRoute.snapshot.params.beltData;
    if (b64data != null) {
      const b = this.beltDataService.importBeltData(b64data);
      if (b == null) {
        this.router.navigate(['/']);
      } else {
        this.decodedBeltData = b;
      }
    }
  }

  isImportMode(): boolean {
    return this.decodedBeltData != null;
  }

  getBelts(): Belt[] {
    if (this.decodedBeltData != null) {
      return this.decodedBeltData.belts;
    }
    return this.beltDataService.getBelts();
  }

  getBeltCount(): number {
    return this.getBelts().length;
  }

  getOwnerName(): string {
    if (this.decodedBeltData != null) {
      return (this.decodedBeltData.name != null) ? this.decodedBeltData.name : '(名称未設定)';
    }
    return this.beltDataService.getSaveslotName();
  }

  beltNameFormat(beltType: number): string{
    let typeName;

    if (beltType === 0) {
      typeName = '戦神';
    } else {
      typeName = '輝石';
    }
    return typeName;
  }

  effectFormat(slots: Slot[]): string{
    let effectCount = 0;
    for (const slot of slots) {
      if (slot.category != null){
        effectCount++;
      }
    }
    let effectCnt = '';
    effectCnt = '　+';
    effectCnt += effectCount;
    return effectCnt;
}

  stringFormat(slot: Slot): string {
    if (slot.category == null || slot.attribute == null) {
      return '';
    }
    const category = this.masterDataService.getCategory(slot.category);
    let effectAll = category.descTemplate;
    effectAll = effectAll.replace('%label%', category.label);
    if (category.subCategoryOptions != null && slot.subCategory != null){
      effectAll = effectAll.replace('%subCategory%', category.subCategoryOptions[slot.subCategory]);
    }
    effectAll = effectAll.replace('%attribute%', category.attributeOptions[slot.attribute]);
    return effectAll;
  }

  onClickImportYes(): void{
    if (this.decodedBeltData) {
      this.beltDataService.overwriteBeltData(this.decodedBeltData.belts);
    }
    this.router.navigate(['']);
  }

  onClickImportNo(): void{
    this.router.navigate(['']);
  }

  onClickUpdate(keyTime: string): void {
    this.router.navigate(['b', keyTime]);
  }

  onClickDelete(keyTime: string): void {
    this.beltDataService.deleteBelt(keyTime);
  }

  toggleConds(): void {
    this.showConds = !this.showConds;
  }

  onClickSearch(series: string, cond: string, label: string): void{
    if (this.conds[series] != null && this.conds[series].cond === cond) {
      delete this.conds[series];
      return;
    }
    this.conds[series] = {
      cond,
      label,
    };
  }

  isCondActive(series: string, label: string): boolean {
    return (this.conds[series] != null && this.conds[series].label === label);
  }

  isMatched(belt: Belt): boolean {
    const cond1 = this.conds['武器系']?.cond;
    const cond2 = this.conds['呪文系']?.cond;
    const cond3 = this.conds['特技系']?.cond;
    const cond4 = this.conds['モンスター系']?.cond;
    let cond2Prefix;
    let cond3Prefix;
    let cond4Prefix;

    if (cond2){
      cond2Prefix = cond2.substring(3, 4);
      cond2Prefix = parseInt(cond2Prefix, 10);
    }

    if (cond3){
      cond3Prefix = cond3.substring(3, 4);
      cond3Prefix = parseInt(cond3Prefix, 10);
    }
    if (!cond1 && !cond2 && !cond3 && !cond4){
      return true;
    }

    for (const slot of belt.slots){

      if (belt.beltType === 0){
        if (cond1){
          if (cond2){
            if (slot.category === cond1 && slot.subCategory === cond2Prefix){
              return true;
            } else {
              continue;
            }
          }
          if (cond3){
            if (slot.category === cond1 && slot.subCategory === cond3Prefix){
              return true;
            } else {
              continue;
            }
          }
          if (slot.category === cond1){
            return true;
          }
        } else {
          if (cond2){
            if (slot.subCategory === cond2Prefix){
              return true;
            }
          }
          if (cond3){
            if (slot.subCategory === cond3Prefix){
              return true;
            }
          }
        }

        if (cond4){
          if (slot.category === cond4){
            return true;
          }
        }
      } else {
        if (cond2){
          if (slot.category === cond2){
            return true;
          }
        }
        if (cond3){
          if (slot.category === cond3){
            return true;
          }
        }
        if (cond4){
          cond4Prefix = '1' + cond4.substring(1, 4);
          if (slot.category === cond4Prefix){
            return true;
          }
        }
      }
    }
    return false;
  }

  isCrownCheck(slot: Slot): boolean{
    if (slot.category == null){
      return false;
    }
    const category = this.masterDataService.getCategory(slot.category);
    if (slot.attribute === category.attributeOptions.length - 1){
      return true;
    }else {
      return false;
    }
  }

  onClickExport(e: Event): void {
    // href を無視させる
    e.preventDefault();
    const beltData = this.beltDataService.exportBeltData();
    const path = this.router.serializeUrl(this.router.createUrlTree(['i', beltData]));
    this.exportUrl = location.origin + path;
    this.isShowExport = true;
  }

  onClickCloseExport(): void {
    this.isShowExport = false;
  }

  copyToClickborad(): void {
    navigator.clipboard.writeText(this.exportUrl);
    if (this.exportUrlElement) {
      this.exportUrlElement.nativeElement.select();
    }
  }
}
