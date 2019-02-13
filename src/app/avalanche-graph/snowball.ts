import { AvalancheNetwork, RequestMessage, AvalancheNode, AvalancheConfig } from "./avalanche-network";

export class Snowball<T> extends AvalancheNode<T> {
    lastColor: T;
    confidenceColorCounter: Map<T, number>;
    counter: number = 0;

    constructor(colors: T[], id: number, config: AvalancheConfig, initialColor: T, network: AvalancheNetwork<T>, updateColor: (color: T) => void, onAccept: () => void) {
        super(id, config, initialColor, network, updateColor, onAccept);
        this.confidenceColorCounter = new Map<T, number>();
        for (let color of colors)
        {
            this.confidenceColorCounter.set(color, 0);
        }
    }

    onRoundCompleted(sampleSize: number, colorCounter: Map<T, number>){
        for (let color of Array.from(colorCounter.keys()))
        {
            if (colorCounter.get(color) > this.config.alpha * sampleSize) {
                let count = this.confidenceColorCounter.get(color);
                if (!count) count = 1;
                else ++count;
                this.confidenceColorCounter.set(color, count);
                 if (this.hasGreaterConfidence(color)) {
                    this.color = color;
                    this.updateColor(color);
                }
                if (color != this.lastColor) {
                    this.lastColor = color;
                    this.counter = 0;
                }
                else {
                    ++this.counter;
                }
            }
        }
        
        if (this.counter > this.config.beta){
            this.onAccept();
        }
        else {
            this.loop();
        }
    }

    getConfidenceCounters() {

    }

    hasGreaterConfidence(newColor: T)
    {
        return this.confidenceColorCounter.get(newColor) > this.confidenceColorCounter.get(this.color);
    }
}
