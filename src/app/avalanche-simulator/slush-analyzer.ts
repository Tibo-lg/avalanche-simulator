

export class SlushAnalyzer {

    numberOfNodes: number;
    sampleSize: number;
    alpha: number;
    probabilityMatrix: number[][];

    constructor(numberOfNodes: number, sampleSize: number, alpha: number) {
        this.numberOfNodes = numberOfNodes;
        this.sampleSize = sampleSize;
        this.alpha = alpha;
    }

    getExpectedNumberOfSteps() {

    }

    generateAllPossibleNonSequences(numberOfSteps: number, i: number) {

    }

    computeProbabilityMatrix() {
        let numberOfNodes = this.numberOfNodes;
        this.probabilityMatrix = [];

        this.probabilityMatrix[0] = [];
        this.probabilityMatrix[0][0] = 1;
        this.probabilityMatrix[numberOfNodes - 1] = [];
        this.probabilityMatrix[numberOfNodes - 1][numberOfNodes - 1];

        for (let i = 1; i < numberOfNodes - 2; i++) {
            this.probabilityMatrix[i][i - 1] = this.computePSi(i);
            this.probabilityMatrix[i][i + 1] = this.computeQSi(i);
            this.probabilityMatrix[i][i] = 1 - this.probabilityMatrix[i][i - 1] - this.probabilityMatrix[i][i + 1];
        }
    }

    computePSi(i: number) {
        let numberOfNodes = this.numberOfNodes;
        return (numberOfNodes - i) / numberOfNodes * this.computeProbabilityOfAchievingThreshold(i);
    }

    computeQSi(i: number) {
        let numberOfNodes = this.numberOfNodes;
        return (i) / numberOfNodes * this.computeProbabilityOfAchievingThreshold(numberOfNodes - i);
    }

    computeProbabilityOfAchievingThreshold(x: number): number {
        let sum: number = 0;
        let sampleSize = this.sampleSize;
        let numberOfNodes = this.numberOfNodes;
        let threshold = sampleSize * this.alpha;
        let nMinusX = numberOfNodes - x;
        let nChoseK = this.binomial(numberOfNodes, sampleSize);

        for (let j = threshold; j < sampleSize; j++) {
            sum += this.binomial(x, j) * this.binomial(nMinusX, sampleSize - j) / nChoseK;
        }

        return sum;
    }

    binomial(n: number, k: number): number {
        var coeff = 1;
        for (var x = n - k + 1; x <= n; x++) coeff *= x;
        for (x = 1; x <= k; x++) coeff /= x;
        return coeff;
    }
}