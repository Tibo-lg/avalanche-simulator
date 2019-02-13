import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule, MatSelectModule, MatOptionModule, MatSidenavModule, MatButtonModule, MatSliderModule, MatCheckboxModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { AvalancheSimulatorComponent } from './avalanche-simulator/avalanche-simulator.component';
import { AvalancheGraphComponent } from './avalanche-graph/avalanche-graph.component';

@NgModule({
  declarations: [
    AppComponent,
    AvalancheSimulatorComponent,
    AvalancheGraphComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    MatSidenavModule,
    MatButtonModule,
    MatSliderModule,
    MatCheckboxModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})

export class AppModule { }
