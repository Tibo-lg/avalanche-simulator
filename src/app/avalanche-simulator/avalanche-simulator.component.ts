import { Component, OnInit, ViewChild } from '@angular/core';
import { Algorithm, AvalancheGraphComponent } from 'src/app/avalanche-graph/avalanche-graph.component';
import { AvalancheConfig } from 'src/app/avalanche-graph/avalanche-network';

@Component({
  selector: 'app-avalanche-simulator',
  templateUrl: './avalanche-simulator.component.html',
  styleUrls: ['./avalanche-simulator.component.css']
})
export class AvalancheSimulatorComponent implements OnInit {

  @ViewChild(AvalancheGraphComponent, { static: true })
  avalancheGraph: AvalancheGraphComponent;

  avalancheConfig: AvalancheConfig = {
    algorithm: Algorithm.Slush,
    alpha: 0.6,
    beta: 15,
    byzantineProbability: 0.1,
    numberOfColors: 2,
    numberOfNodes: 50,
    sampleSize: 10,
    m: 10
  };

  algorithmValues = Algorithm;
  algorithmOptions = Object.keys(this.algorithmValues);
  numberOfRedNodes: number;

  constructor() {
  }

  ngOnInit() {
  }

  onDecided() {
  }

  start() {
    this.avalancheGraph.Run();
  }

  reset() {
    this.avalancheGraph.ngOnInit();
  }
}
