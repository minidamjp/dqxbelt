import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BeltAddComponent } from './belt-add/belt-add.component';
import { BeltListComponent } from './belt-list/belt-list.component';
import { SaveslotComponent } from './saveslot/saveslot.component';

@NgModule({
  declarations: [
    AppComponent,
    BeltAddComponent,
    BeltListComponent,
    SaveslotComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
