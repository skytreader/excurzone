/**
Models the probability that the Exkur Counterdefense has caught the player as
a function of in-game elapsed time.
*/
export interface ExkurCounterdefense {
    hasCaught(gameTime: number): boolean;
}

/**
This is rigged so that the player is soooo not ever killed immediately.
*/
export class LinearExkurCounterdefense implements ExkurCounterdefense {
    private playerLuckRig: number = 3;
    constructor(
        private slope: number = (1 / 120000)
    ){}

    public hasCaught(gameTime: number): boolean {
        if (this.playerLuckRig <= 0){
            const threshold = this.slope * gameTime;
            return Math.random() <= threshold;
        } else{
            this.playerLuckRig--;
            return false;
        }
    }
}
