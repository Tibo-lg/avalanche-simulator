import { AvalancheNetwork, RequestMessage, AvalancheNode, Round, AvalancheConfig } from "./avalanche-network";

export class Byzantine<T> extends AvalancheNode<T> {

    colors: T[];

    constructor(colors: T[], id: number, config: AvalancheConfig, initialColor: T, network: AvalancheNetwork<T>, updateColor: (color: T) => void, onAccept: () => void) {
        super(id, config, initialColor, network, updateColor, onAccept);
        this.colors = colors;
    }

    onRoundCompleted(sampleSize: number, colorCounter: Map<T, number>){
        var sortedColors = Array.from(colorCounter.entries()).sort((a, b) => b[1] - a[1]);
        if (sortedColors.length > 1) {
            this.color = sortedColors[1][0];
        } else {
            let goodColor = sortedColors[0][0];
            let color;
            do
            {
                color = Math.floor(Math.random() * (this.colors.length));
            } while (this.colors[color] == goodColor);

            this.color = this.colors[color];
        }

        this.updateColor(this.color);

        this.loop();
    }
}