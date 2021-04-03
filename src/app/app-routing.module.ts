import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BeltAddComponent } from './belt-add/belt-add.component';
import { BeltListComponent } from './belt-list/belt-list.component';
import { SaveslotComponent } from './saveslot/saveslot.component';

const routes: Routes = [
  { path: 'b/new', component: BeltAddComponent },
  { path: 'b/:id', component: BeltAddComponent },
  { path: 'i/:beltData', component: BeltListComponent },
  { path: 'saveslot', component: SaveslotComponent },
  { path: '', component: BeltListComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
