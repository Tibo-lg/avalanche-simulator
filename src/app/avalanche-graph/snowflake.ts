import { AvalancheNetwork, RequestMessage, AvalancheNode, Round} from "./avalanche-network";

export class Snowflake<T> extends AvalancheNode<T>{

    counter: number = 0;

    onRoundCompleted(sampleSize: number, colorCounter: Map<T, number>){
        for (let color of Array.from(colorCounter.keys()))
        {
            if (colorCounter.get(color) > this.config.alpha * sampleSize) {
                if (this.color != color) {
                    this.color = color;
                    this.updateColor(color);
                    this.counter = 0;
                    break;
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
}
