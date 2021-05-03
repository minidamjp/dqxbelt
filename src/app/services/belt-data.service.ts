import * as Pako from 'pako';

import { Injectable } from '@angular/core';

import { Belt } from '../models/belt';
import { Exportdata } from '../models/exportdata';
import { Saveslot } from '../models/saveslot';
import { Slot } from '../models/slot';

@Injectable({
  providedIn: 'root'
})
export class BeltDataService {
  readonly MAX_SAVE_SLOT = 5;
  readonly SAVESLOT_KEY = 'saveslots';
  readonly DEFAULT_ITEM_KEY = 'beltdata';
  readonly INITIAL_SAVESLOT: Saveslot = {
    id: this.DEFAULT_ITEM_KEY,
    name: '',
    active: true,
};
  private belts: Belt[] = [];
  private saveslots: Saveslot[] = [];
  private activeSaveslot: Saveslot = {...this.INITIAL_SAVESLOT};

  constructor() {
    try {
      this.loadSaveslots();
    } catch (e) {
      console.error('Failed to load configurations: %o', e);
      this.initSaveslots();
    }

    try {
      this.loadBelts();
    } catch (e) {
      console.error('Failed to load configurations: %o', e);
    }
  }

  private initSaveslots(): void {
      // 初期データ作成
      this.saveslots = [
        {...this.INITIAL_SAVESLOT},
      ];
      this.activeSaveslot = this.saveslots[0];
  }

  // セーブスロット関連
  private loadSaveslots(): void {
    const saveslotsJson = localStorage.getItem(this.SAVESLOT_KEY);
    if (!saveslotsJson) {
      // データが保存されていない
      // 初期データ作成
      this.initSaveslots();
      return;
    }
    this.saveslots = JSON.parse(saveslotsJson);
    if (this.saveslots.length === 0) {
      this.initSaveslots();
      return;
    }
    for (const saveslot of this.saveslots) {
      if (saveslot.active) {
        this.activeSaveslot = saveslot;
        return;
      }
    }
    this.activeSaveslot = this.saveslots[0];
    this.activeSaveslot.active = true;
  }

  private saveSaveslots(): void {
    localStorage.setItem(this.SAVESLOT_KEY, JSON.stringify(this.saveslots));
  }

  getSaveslots(): Saveslot[] {
    return this.saveslots;
  }

  isSaveslotEnabled(): boolean {
    return (this.saveslots.length > 1 || this.activeSaveslot.name !== '');
  }

  getSaveslotName(): string {
    return this.activeSaveslot.name !== '' ? this.activeSaveslot.name : '(名称未設定)';
  }

  isSaveslotAddable(): boolean {
    return this.saveslots.length  < this.MAX_SAVE_SLOT;
  }

  addSaveslot(): Saveslot | null {
    if (!this.isSaveslotAddable()) {
      return null;
    }
    const id =  'belt' + new Date().getTime().toString();
    const saveslot: Saveslot = {
      id,
      name: '',
      active: false,
    };
    this.saveslots.push(saveslot);
    this.saveSaveslots();
    return saveslot;
  }

  updateSaveslot(newSaveslot: Saveslot): void {
    newSaveslot = {...newSaveslot};
    for (let i = 0; i < this.saveslots.length; ++i) {
      const saveslot = this.saveslots[i];
      if (saveslot.id === newSaveslot.id) {
        this.saveslots.splice(i, 1, newSaveslot);
        this.saveSaveslots();
        if (this.activeSaveslot.id === newSaveslot.id) {
          this.activeSaveslot = newSaveslot;
        }
        return;
      }
    }
  }

  deleteSaveslot(id: string): void {
    for (let i = 0; i < this.saveslots.length; ++i) {
      const saveslot = this.saveslots[i];
      if (saveslot.id === id) {
        localStorage.removeItem(saveslot.id);
        this.saveslots.splice(i, 1);
        if (!saveslot.active) {
          this.saveSaveslots();
          return;
        }
        // 現在選択されていたら別のスロットを選択
        if (this.saveslots.length === 0) {
          this.addSaveslot();
        }
        this.activateSaveslot(this.saveslots[0].id);
        return;
      }
    }
  }

  getSaveslot(id: string): Saveslot | null {
    for (const saveslot of this.saveslots) {
      if (saveslot.id === id) {
        return saveslot;
      }
    }
    return null;
  }

  activateSaveslot(id: string): void {
    const saveslot = this.getSaveslot(id);
    if (!saveslot || saveslot.active) {
      return;
    }
    for (const s of this.saveslots) {
      s.active = false;
    }
    saveslot.active = true;
    this.activeSaveslot = saveslot;
    this.saveSaveslots();
    this.loadBelts();
  }

  // ベルトデータ関連
  private getItemKey(): string {
    return this.activeSaveslot.id;
  }

  private loadBelts(): void {
    const beltJson = localStorage.getItem(this.getItemKey());
    if (!beltJson) {
      // データが保存されていない
      this.belts = [];
      return;
    }
    const b  = this.deserializeBelts(beltJson);
    if (b != null) {
      this.belts = b;
    }
  }

  private serializeBelts(withName?: boolean): string {
    const exportdata: Exportdata = {
      version: 20210329,
      belts: this.belts,
    };
    if (withName && this.activeSaveslot.name !== '') {
      exportdata.name = this.activeSaveslot.name;
    }
    return JSON.stringify(exportdata);
  }

  private deserializeBelts(beltJson: string): Belt[] | null {
    const exportdata = this.deserializeExportdataFromJson(beltJson);
    if (!exportdata) {
      return null;
    }
    return exportdata.belts;
  }

  private deserializeExportdataFromJson(beltJson: string): Exportdata | null {
    const exportdata: Exportdata = JSON.parse(beltJson);
    if (exportdata.version == null || exportdata.version < 20210329) {
      // マスターデータ化以前の古いデータ
      return null;
    }
    return exportdata;
  }

  private deserializeExportdataFromBinary(beltdata: Uint8Array): Exportdata | null {
    // 0x00  確実に JSON と異なるデータにするため
    // バージョン (1bytes)
    // 名前
    // 0x00
    // 0x00
    // ベルト分繰り返し
    //   keyTime (should be 8byte letters)
    //   0x00
    //   note
    //   0x00
    //   0x00
    //   スロット数 (1bytes)
    //   スロット分繰り返し
    //     category (2bytes)
    //     subCategory (1bytes)
    //     attriburte (1bytes)
    let pos = 0;
    const header = beltdata[pos++];
    const version = beltdata[pos++];

    const namebuf: number[] = [];
    while (true) {
      if (pos >= beltdata.length) {
        break;
      }
      // tslint:disable-next-line: no-bitwise
      const c = (beltdata[pos++] << 8) | beltdata[pos++];
      if (c === 0) {
        break;
      }
      namebuf.push(c);
    }
    const name = String.fromCharCode(...namebuf);

    const belts: Belt[] = [];
    while (true) {
      if (pos >= beltdata.length) {
        break;
      }
      const keyTimeBuf: number[] = [];
      while (true) {
        // tslint:disable-next-line: no-bitwise
        const c = beltdata[pos++];
        if (c === 0) {
          break;
        }
        keyTimeBuf.push(c);
      }
      const keyTime = String.fromCharCode(...keyTimeBuf);

      const notebuf: number[] = [];
      while (true) {
        if (pos >= beltdata.length) {
          break;
        }
          // tslint:disable-next-line: no-bitwise
        const c = (beltdata[pos++] << 8) | beltdata[pos++];
        if (c === 0) {
          break;
        }
        notebuf.push(c);
      }
      const note = String.fromCharCode(...notebuf);

      let beltType = 0;
      const slots: Slot[] = [];

      const slotnum = beltdata[pos++];
      for (let i = 0; i < slotnum; ++i) {
        // tslint:disable-next-line: no-bitwise
        const categoryValue = (beltdata[pos++] << 8) | beltdata[pos++];
        const subCategory = beltdata[pos++];
        const attribute = beltdata[pos++];
        if (categoryValue >= 1000) {
          beltType = 1;
        }
        const category = String(categoryValue).padStart(4, '0');
        slots.push({
          category,
          subCategory,
          attribute,
        });
      }

      belts.push({
        keyTime,
        beltType,
        slots,
        note,
      });
    }

    return {
      name,
      belts,
    };
  }

  private saveBelts(): void {
    localStorage.setItem(this.getItemKey(), this.serializeBelts());
  }

  public exportBeltData(): string {
    return this.exportBeltDataWithBinary();
  }

  public exportBeltDataWithBinary(): string {
    // 0x00  確実に JSON と異なるデータにするため
    // バージョン (1bytes)
    // 名前
    // 0x00
    // 0x00
    // ベルト分繰り返し
    //   keyTime (should be 8byte letters)
    //   0x00
    //   note
    //   0x00
    //   0x00
    //   スロット数 (1bytes)
    //   スロット分繰り返し
    //     category (2bytes)
    //     subCategory (1bytes)
    //     attriburte (1bytes)
    const version = 0;
    const buffer: number[] = [];
    buffer.push(0);
    buffer.push(version);

    for (let i = 0; i < this.activeSaveslot.name.length; ++i) {
      const c = this.activeSaveslot.name.charCodeAt(i);
      // tslint:disable-next-line: no-bitwise
      buffer.push((c >> 8) & 0xff);
      // tslint:disable-next-line: no-bitwise
      buffer.push(c & 0xff);
    }
    buffer.push(0);
    buffer.push(0);

    for (const belt of this.belts) {
      for (let i = 0; i < belt.keyTime.length; ++i) {
        const c = belt.keyTime.charCodeAt(i);
        // tslint:disable-next-line: no-bitwise
        buffer.push(c & 0xff);
      }
      buffer.push(0);

      if (belt.note) {
        for (let i = 0; i < belt.note.length; ++i) {
          const c = belt.note.charCodeAt(i);
          // tslint:disable-next-line: no-bitwise
          buffer.push((c >> 8) & 0xff);
          // tslint:disable-next-line: no-bitwise
          buffer.push(c & 0xff);
        }
      }
      buffer.push(0);
      buffer.push(0);

      const slots: Slot[] = [];
      for (const slot of belt.slots) {
        if (slot.category == null) {
          continue;
        }
        slots.push(slot);
      }
      buffer.push(slots.length);
      for (const slot of slots) {
        const category = (slot.category) ? parseInt(slot.category, 10) : 0;
        // tslint:disable-next-line: no-bitwise
        buffer.push((category >> 8) & 0xff);
        // tslint:disable-next-line: no-bitwise
        buffer.push(category & 0xff);

        const subcategory = (slot.subCategory) ? slot.subCategory : 0;
        // tslint:disable-next-line: no-bitwise
        buffer.push(subcategory & 0xff);

        const attribute = (slot.attribute) ? slot.attribute : 0;
        // tslint:disable-next-line: no-bitwise
        buffer.push(attribute & 0xff);
    }
  }
    const data = new Uint8Array(buffer);
    const compressed = Pako.deflate(data);
    return btoa(String.fromCharCode(...compressed)).replace(/\//g, '_').replace(/\+/g, '-').replace(/=/g, '');
  }

  public exportBeltDataWithJson(): string {
    const compressed = Pako.deflate(this.serializeBelts(true));
    return btoa(String.fromCharCode(...compressed)).replace(/\//g, '_').replace(/\+/g, '-').replace(/=/g, '');
  }

  public importBeltData(b64data: string): Exportdata | null {
    try {
      const binary = atob(b64data.replace(/_/g, '/').replace(/-/g, '+'));
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; ++i) {
        bytes[i] = binary.charCodeAt(i);
      }
      // Pako deflates strings with UTF-8
      const beltdata = Pako.inflate(bytes);
      if (beltdata[0] === 0x7b) {
        const beltJson = Pako.inflate(bytes, {to: 'string'});
        return this.deserializeExportdataFromJson(beltJson);
      }
      return this.deserializeExportdataFromBinary(beltdata);
    } catch (e) {
      console.error(`Failed to parse beltData: ${b64data}: %o`, e);
      return null;
    }
  }

  public overwriteBeltData(beltData: Belt[]): void {
    this.belts = beltData;
    this.saveBelts();
  }

  private copySlots(slots: Slot[]): Slot[] {
    // 元のデータが変更された時に影響が出ないよう、
    // データのコピーを作成する。
    const clonedSlots: Slot[] = [];
    for (const slot of slots) {
      const clonedSlot: Slot = {
        category: slot.category,
        subCategory: slot.subCategory,
        attribute: slot.attribute,
      };
      clonedSlots.push(clonedSlot);
    }
    return clonedSlots;
  }

  addBelt(keyTime: string, beltType: number, note: string, slots: Slot[]): void {
    this.belts.unshift({
      keyTime,
      beltType,
      note,
      slots: this.copySlots(slots),
    });
    this.saveBelts();
  }

  replaceBelt(keyTime: string, beltType: number, note: string, slots: Slot[]): void {
    for (const belt of this.belts) {
      if (keyTime === belt.keyTime) {
        belt.beltType = beltType;
        belt.note = note;
        belt.slots = slots;
        this.saveBelts();
        return;
      }
    }
  }

  deleteBelt(keyTime: string): void {
    for (const [idx, belt] of this.belts.entries()) {
      if (keyTime === belt.keyTime) {
        this.belts.splice(idx, 1);
        this.saveBelts();
        return;
      }
    }
  }

  getBelts(): Belt[] {
    return this.belts;
  }

  getCopyOfBelt(keyTime: string): Belt | null {
    for (const belt of this.belts) {
      if (keyTime === belt.keyTime) {
        return {
          keyTime: belt.keyTime,
          beltType: belt.beltType,
          note: belt.note,
          slots: this.copySlots(belt.slots),
        };
      }
    }
    return null;
  }
}
