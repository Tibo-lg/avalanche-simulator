import { AvalancheNetwork, RequestMessage, AvalancheNode, Round, AvalancheConfig } from "./avalanche-network";

export class Slush<T> extends AvalancheNode<T> {

    m: number;

    constructor(id: number, config: AvalancheConfig, initialColor: T, network: AvalancheNetwork<T>, updateColor: (color: T) => void, onAccept: () => void) {
        super(id, config, initialColor, network, updateColor, onAccept);
        this.m = config.m;
    }

    onRoundCompleted(sampleSize: number, colorCounter: Map<T, number>){
        for (let color of Array.from(colorCounter.keys()))
        {
            if (colorCounter.get(color) > this.config.alpha * sampleSize) {
                this.color = color;
                this.updateColor(color);
            }
        }

        if (--this.m > 0){
            this.loop();
        }
        else {
            this.onAccept();
        }
    }

    onRoundPass() {
        --this.m;
    }
}
