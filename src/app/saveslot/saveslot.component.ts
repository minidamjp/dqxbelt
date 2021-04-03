import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { Saveslot } from '../models/saveslot';
import { BeltDataService } from '../services/belt-data.service';

@Component({
  selector: 'app-saveslot',
  templateUrl: './saveslot.component.html',
  styleUrls: ['./saveslot.component.scss']
})
export class SaveslotComponent implements OnInit {

  editingSaveslotId: string | null = null;
  editingName = '';

  @ViewChild('nameField')
  set nameField(nameField: ElementRef) {
    if (nameField == null) {
      return;
    }
    nameField.nativeElement.focus();
  }

  constructor(
    public beltDataService: BeltDataService,
  ) {
  }

  ngOnInit(): void {
  }

  onClickRow(saveslot: Saveslot): void {
    if (this.editingSaveslotId === null) {
      return;
    }
    if (this.editingSaveslotId === saveslot.id) {
      return;
    }
    this.cancelEditSaveslot();
  }

  isSaveslotAddable(): boolean {
    return this.beltDataService.isSaveslotAddable();
  }

  addSaveslot(): void {
    this.beltDataService.addSaveslot();
  }

  deleteSaveslot(saveslot: Saveslot): void {
    this.beltDataService.deleteSaveslot(saveslot.id);
  }

  startEditSaveslot(saveslot: Saveslot): void {
    this.editingName = saveslot.name;
    this.editingSaveslotId = saveslot.id;
  }

  completeEditSaveslot(saveslot: Saveslot): void {
    saveslot.name = this.editingName;
    this.editingSaveslotId = null;
  }

  cancelEditSaveslot(): void {
    this.editingSaveslotId = null;
  }

  activateSaveslot(saveslot: Saveslot): void {
    this.beltDataService.activateSaveslot(saveslot.id);
  }
}
