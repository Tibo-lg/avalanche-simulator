import { AfterViewInit, Component, OnInit, Input, ElementRef } from '@angular/core';
import { DataSet, Network, Node, Edge } from 'vis';
import { AvalancheNetwork, AvalancheConfig, AvalancheNode } from './avalanche-network';
import { Byzantine } from './byzantine';
import { Slush } from './slush';
import { Snowball } from './snowball';
import { Snowflake } from './snowflake';
import { ViewChild } from '@angular/core';
import { SimpleChanges } from '@angular/core/src/metadata/lifecycle_hooks';

@Component({
    selector: 'app-avalanche-graph',
    templateUrl: './avalanche-graph.component.html',
    styleUrls: ['./avalanche-graph.component.css']
})
export class AvalancheGraphComponent implements OnInit {

    @Input() avalancheConfig: AvalancheConfig;
    @Input() decidedCallback: () => void;
    @ViewChild('visContainer') visGraph: ElementRef;
    colors: string[] = [
        "rgb(38, 239, 27)",
        "rgb(17, 24, 248)",
        "rgb(255, 255, 0)",
        "rgb(153, 102, 51)",
    ];
    labelColors: string[] = [
        "black",
        "white",
        "black",
        "white"
    ]
    nodes: AvalancheNode<number>[];
    network: AvalancheNetwork<number>;
    nodeDataSet: DataSet<Node>;
    edges: DataSet<Edge>;
    visNetwork: Network;
    byzantineNodes: number[] = [];
    undecidedNodes: number;
    selectedNode: AvalancheNode<number>;
    algorithmValues = Algorithm;
    decidedCorrectly: boolean = false;
    decidedIncorrectly: boolean = false;
    lastDecidedColor: number;
    showEdge: boolean = true;
    delay: number = 100;

    constructor() {
    }

    ngOnInit() {
        this.cleanUp();
        let visNodes = [];
        for (let i = 0; i < this.avalancheConfig.numberOfNodes; i++) {
            visNodes.push({
                id: i,
                label: "" + i,
            });
        }

        let nbByzantineNodes = Math.floor(this.avalancheConfig.byzantineProbability * this.avalancheConfig.numberOfNodes);
        this.byzantineNodes = [];
        this.nodeDataSet = new DataSet(visNodes);
        this.edges = new DataSet([]);

        while (this.byzantineNodes.length < nbByzantineNodes) {
            var r = Math.floor(Math.random() * (this.avalancheConfig.numberOfNodes - 1));
            if (this.byzantineNodes.indexOf(r) === -1) {
                this.byzantineNodes.push(r);
                this.nodeDataSet.update({
                    id: r,
                    label: '😈',
                });
            }
        }

        this.undecidedNodes = this.avalancheConfig.numberOfNodes - nbByzantineNodes;

        this.network = new AvalancheNetwork<number>(
            (sender, receiver) => this.onStartMessage(sender, receiver),
            (sender, receiver) => this.onEndMessage(sender, receiver),
            () => this.delay);

        let colorIndexes = this.colors.map((x, i) => i + 1).slice(0, this.avalancheConfig.numberOfColors);

        let getNode = (id): AvalancheNode<number> => {
            let color = Math.floor(Math.random() * (this.avalancheConfig.numberOfColors + 1));
            if (this.byzantineNodes.indexOf(id) !== -1) {
                return new Byzantine<number>(
                    colorIndexes,
                    id,
                    this.avalancheConfig,
                    color,
                    this.network,
                    (color) => this.updateColor(id, color),
                    () => this.onAccept(id));
            }

            switch (this.avalancheConfig.algorithm) {
                case Algorithm.Slush:
                    return new Slush<number>(id, this.avalancheConfig, color, this.network, (color) => this.updateColor(id, color), () => this.onAccept(id));
                    break;
                case Algorithm.Snowflake:
                    return new Snowflake<number>(id, this.avalancheConfig, color, this.network, (color) => this.updateColor(id, color), () => this.onAccept(id));
                    break;
                case Algorithm.Snowball:
                    return new Snowball<number>(colorIndexes, id, this.avalancheConfig, color, this.network, (color) => this.updateColor(id, color), () => this.onAccept(id));
                    break;
                default:
                    throw new Error("invalid policy");
            }
        }

        this.nodes = visNodes.map((node) => {
            return getNode(node.id);
        });

        let options = {
            nodes: {
                margin: 10,
                font: {
                    size: 25
                },
                color: {
                    background: "rgb(200, 200, 200)",
                    border: "rgb(0, 0, 0)"
                },
                shape: "circle",
                borderWidth: 0,
                chosen: false,
            },
            layout: {
                improvedLayout: false,
            },
            interaction: {
                dragNodes: false,
                dragView: false,
            }
        };

        this.visNetwork = new Network(
            this.visGraph.nativeElement,
            {
                nodes: this.nodeDataSet,
                edges: this.edges,
            },
            options);

        this.visNetwork.on('click', (properties) => this.onNodeClick(properties));
    }

    getColorFromIndex(colorIndex: number) {
        return this.colors[colorIndex - 1];
    }

    getLabelColorFromIndex(colorIndex: number) {
        return this.labelColors[colorIndex - 1];
    }

    onNodeClick(properties: any) {

        if (properties.nodes.length == 0) {
            return;
        }

        let nodeId = properties.nodes[0];

        if (this.byzantineNodes.indexOf(nodeId) === -1)
        {
            this.selectedNode = this.nodes[nodeId];
        }
    }

    cleanUp() {
        if (this.visNetwork) {
            this.visNetwork.destroy();
        }
        if (this.nodeDataSet) {
            this.nodeDataSet.clear();
        }
        if (this.edges) {
            this.edges.clear();
        }
        if (this.network) {
            this.network.stop();
            this.network = null;
        }

        this.selectedNode = null;
        this.decidedIncorrectly = false;
        this.decidedCorrectly = false;
        this.lastDecidedColor = null;
    }

    updateColor(id, color) {
        this.nodeDataSet.update({
            id: id,
            color: {
                background: this.getColorFromIndex(color),
            },
            font: {
                color: this.getLabelColorFromIndex(color),
            }
        });
    }

    onAccept(id) {
        this.nodeDataSet.update({
            id: id,
            borderWidth: 5
        })

        let decidedColor = this.nodes[id].color;

        if (!this.lastDecidedColor) {
            this.lastDecidedColor = decidedColor;
        } else if (this.lastDecidedColor != decidedColor) {
            this.decidedIncorrectly = true;
        }

        if (--this.undecidedNodes == 0) {
            if (this.decidedCallback) this.decidedCallback();
            this.decidedCorrectly = !this.decidedIncorrectly;
            this.network.run = false;
        }
    }

    async Run() {
        for (let i = 0; i < this.avalancheConfig.numberOfNodes; i++) {
            this.nodes[i].loop();
        }

        await this.network.processAllMessage();
    }

    onStartMessage(sender: number, receiver: number) {
        if (this.showEdge)
        {
            this.edges.add([{
                from: sender,
                to: receiver,
                color: "black",
                physics: false,
                arrows: 'to',
                smooth: {
                    type: 'continuous',
                }
            }]);
        }
    }

    onEndMessage(sender: number, receiver: number) {
        this.edges.clear();
    }
}

export enum Algorithm {
    Slush = "0",
    Snowflake = "1",
    Snowball = "2",
}
