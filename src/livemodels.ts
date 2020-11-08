/**
Models the probability that the Exkur Counterdefense has caught the player as
a function of in-game elapsed time.
*/
interface ExkurCounterdefense {
    hasCaught(gameTime: number): boolean;
}

export class LinearExkurCounterdefense implements ExkurCounterdefense {
    constructor(
        private slope: number = 0.01
    ){}

    public hasCaught(gameTime: number): boolean {
        const threshold = this.slope * gameTime;
        return Math.random() <= threshold;
    }
}
