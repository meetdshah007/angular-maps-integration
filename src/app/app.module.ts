import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { MapboxComponent } from './mapbox/mapbox.component';
import { OpenlayerComponent } from './openlayer/openlayer.component';
import { LeafletComponent } from './leaflet/leaflet.component';

@NgModule({
  declarations: [
    AppComponent,
    MapboxComponent,
    OpenlayerComponent,
    LeafletComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
