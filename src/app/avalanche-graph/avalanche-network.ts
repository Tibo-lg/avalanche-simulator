import { Algorithm } from 'src/app/avalanche-graph/avalanche-graph.component';

export class AvalancheConfig {
    sampleSize: number;
    alpha: number;
    beta: number;
    numberOfNodes: number;
    byzantineProbability: number;
    algorithm: Algorithm;
    numberOfColors: number;
    m: number;
}

export class RequestMessage<T> {
    public message: T;
    public origin: number;
    public dest: number;
    public resolve: (message: T) => void;

    constructor(message: T, origin: number, dest: number, resolve: (message: T) => void) {
        this.message = message;
        this.origin = origin;
        this.dest = dest;
        this.resolve = resolve;
    }
}

export abstract class AvalancheNode<T> {
    readonly id: number;
    public color: T;
    protected config: AvalancheConfig;
    protected network: AvalancheNetwork<T>;
    protected updateColor: (color: T) => void;
    protected onAccept: () => void;
    rounds: Round<T>[];

    constructor(id: number, config: AvalancheConfig, initialColor: T, network: AvalancheNetwork<T>, updateColor: (color: T) => void, onAccept: () => void) {
        this.id = id;
        this.config = config;
        this.color = initialColor;
        this.updateColor = updateColor;
        this.network = network;
        this.network.register(id, this);
        this.rounds = [];
        this.updateColor = updateColor;
        this.onAccept = onAccept;
        this.updateColor(initialColor);
    }

    getColor(color: T): T {
        if (!this.color) {
            this.color = color;
            this.updateColor(color);
        }

        return this.color;
    }

    removeRound(round: Round<T>) {
        this.rounds.splice(this.rounds.indexOf(round), 1);
    }

    async loop(): Promise<void> {
        if (!this.color) {
            await sleep(10);
            this.onRoundPass();
        }

        let sample = this.network.randomlySampleNodes(this.config.sampleSize, this.id);
        let round = new Round<T>(sample.length, (round) => {
            this.removeRound(round);
            this.onRoundCompleted(sample.length, round.colorCounter);
        });

        this.rounds.push(round);

        for (let node of sample) {
            this.network.query(new RequestMessage<T>(this.color, this.id, node, (color: T) => round.handleResponse(color)));
        }
    }

    passRound(): void {
        this.loop();
    }

    abstract onRoundCompleted(sampleSize: number, colorCounter: Map<T, number>): void;

    onRoundPass(): void {

    }
}

export class Round<T>
{
    public readonly colorCounter: Map<T, number>;
    protected pendingRequests: number;
    protected onCompleted: (round: Round<T>) => void;
    init: boolean = false;

    constructor(nbRequests: number, onCompleted: (round: Round<T>) => void) {
        this.pendingRequests = nbRequests;
        this.onCompleted = onCompleted;
        this.colorCounter = new Map<T, number>();
        this.init = true;
    }

    handleResponse(color: T): void {
        let count = this.colorCounter.get(color);
        if (!count) count = 0;
        count++;
        this.colorCounter.set(color, count);
        this.pendingRequests--;
        if (this.pendingRequests == 0) {
            this.onCompleted(this);
        }
    }
}

export class AvalancheNetwork<T> {
    nodes: Map<number, AvalancheNode<T>>;
    public requestQueue: RequestMessage<T>[];
    run: boolean;
    delay: () => number;
    onStartMessage: (sender: number, receiver: number) => void;
    onEndMessage: (sender: number, receiver: number) => void;

    constructor(
        onStartMessage: (sender: number, receiver: number) => void,
        onEndMessage: (sender: number, receiver: number) => void,
        delay: () => number) {
        this.nodes = new Map<number, AvalancheNode<T>>();
        this.run = false;
        this.onStartMessage = onStartMessage;
        this.onEndMessage = onEndMessage;
        this.delay = delay;
    }

    register(id: number, node: AvalancheNode<T>) {
        this.nodes.set(id, node);
        this.requestQueue = [];
    }

    randomlySampleNodes(k: number, requester: number): number[] {
        let sample = [];

        if (k > this.nodes.size) {
            k = this.nodes.size;
        }

        while (sample.length < k) {
            var r = Math.floor(Math.random() * this.nodes.size);
            if (sample.indexOf(r) === -1 && r !== requester) {
                sample.push(r);
            }
        }

        return sample;
    }

    query(message: RequestMessage<T>) {
        this.requestQueue.push(message);
    }

    async processNextMessage(): Promise<void> {
        let nextMessage = this.requestQueue.shift();
        this.onStartMessage(nextMessage.origin, nextMessage.dest);
        nextMessage.resolve(this.nodes.get(nextMessage.dest).getColor(nextMessage.message));
        await sleep(this.delay());
        this.onEndMessage(nextMessage.origin, nextMessage.dest);
    }

    async processAllMessage() {
        this.run = true;
        while (this.requestQueue.length != 0 && this.run == true) {
            await this.processNextMessage();
        }
        this.run = false;
    }

    stop() {
        this.run = false;
    }
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
