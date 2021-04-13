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

class Matcher {
  private cond1: string;
  private cond2: string;
  private cond3: string;
  private cond4: string;
  private cond2Prefix?: number;
  private cond3Prefix?: number;
  private cond4Prefix?: string;

  constructor(conds: { [name: string]: SearchCondition}) {
    this.cond1 = conds['武器系']?.cond;
    this.cond2 = conds['呪文系']?.cond;
    this.cond3 = conds['特技系']?.cond;
    this.cond4 = conds['モンスター系']?.cond;

    if (this.cond2){
      const cond2PrefixStr = this.cond2.substring(3, 4);
      this.cond2Prefix = parseInt(cond2PrefixStr, 10);
    }

    if (this.cond3){
      const cond3PrefixStr = this.cond3.substring(3, 4);
      this.cond3Prefix = parseInt(cond3PrefixStr, 10);
    }

    if (this.cond4){
      this.cond4Prefix = '1' + this.cond4.substring(1, 4);
    }
  }

  public isMatched(belt: Belt): boolean {
    if (!this.cond1 && !this.cond2 && !this.cond3 && !this.cond4){
      return true;
    }

    for (const slot of belt.slots){

      if (belt.beltType === 0){
        if (this.cond1){
          if (this.cond2){
            if (slot.category === this.cond1 && slot.subCategory === this.cond2Prefix){
              return true;
            } else {
              continue;
            }
          }
          if (this.cond3){
            if (slot.category === this.cond1 && slot.subCategory === this.cond3Prefix){
              return true;
            } else {
              continue;
            }
          }
          if (slot.category === this.cond1){
            return true;
          }
        } else {
          return false;
          /*戦神のベルトは属性呪文、属性攻撃のみ入力された場合には表示対象としない
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
          */
        }

        if (this.cond4){
          if (slot.category === this.cond4){
            return true;
          }
        }
      } else {
        if (this.cond2){
          if (slot.category === this.cond2){
            return true;
          }
        }
        if (this.cond3){
          if (slot.category === this.cond3){
            return true;
          }
        }
        if (this.cond4){
          if (slot.category === this.cond4Prefix){
            return true;
          }
        }
      }
    }
    return false;
  }
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
    const matcher = new Matcher(this.conds);
    return matcher.isMatched(belt);
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
