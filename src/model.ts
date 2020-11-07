/**
Units:

- distances - kilometers
- angles - degrees 
*/

const EARTH_RADIUS: number = 6378;
const DEG_TO_RAD: number = 0.0174;

function randomChoice(arr: any[]): any {
    return arr[Math.floor(Math.random() * arr.length)];
}

export class SignificantLocation {
    private isRevealed: boolean;
    constructor(
        private longitude: number,
        private latitude: number,
        private correctsRadar: boolean,
        private counterAttacks: boolean
    ){
        this.isRevealed = false;
    }

    public getLongitude(): number {
        return this.longitude;
    }

    public getLatitude(): number {
        return this.latitude;
    }

    public getCorrectsRadar(): boolean {
        return this.correctsRadar;
    }

    public getCounterAttacks(): boolean {
        return this.counterAttacks;
    }

    public getIsRevealed(): boolean {
        return this.isRevealed;
    }

    public setIsRevealed(isRevealed: boolean): void {
        this.isRevealed = isRevealed;
    }

    public isEqualTo(otherSL: SignificantLocation): boolean {
        return Math.abs(this.longitude - otherSL.getLongitude()) <= 0.0001 &&
               Math.abs(this.latitude - otherSL.getLatitude()) <= 0.0001;
    }

    /*
    Thanks http://www.ggspatial.co.uk/distance-on-a-sphere-the-haversine-formula/
    */
    public haversineDistance(coord: SignificantLocation, planetRadius: number): number {
        const lon1 = this.longitude;
        const lat1 = this.latitude;
        const lon2 = coord.getLongitude();
        const lat2 = coord.getLatitude();

        const phi1 = lat1 * DEG_TO_RAD;
        const phi2 = lat2 * DEG_TO_RAD;

        const dPhi = phi2 - phi1;
        const dLambda = (lon2 - lon1) * DEG_TO_RAD;

        const a = Math.pow(Math.sin(dPhi / 2), 2) + Math.cos(phi1) * Math.cos(phi2) * Math.pow(Math.sin(dLambda / 2), 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return planetRadius * c;
    }
}

/**
Possible difficulty toggles:

- planet radius. The larger the planet, obviously the harder the game is.
     - Or else the allowed hit radius should be adjusted.
- distance computer failure rate. The more accurate readings you get, the better
  you can decide your next attempts.
*/
export class ExcurzoneGame {
    private currentPlayerLocation: SignificantLocation;
    private goal: SignificantLocation;
    private planetCircumference: number;

    constructor(
        private significantLocations: SignificantLocation[], // FIXME Should have at least 2 elements
        private planetRadius: number = EARTH_RADIUS,
        private distFailureRate: number = 0.5 // TODO Ensure it is always in [0, 1]
    ){
        this.currentPlayerLocation = randomChoice(this.significantLocations);
        this.goal = randomChoice(this.significantLocations);
        this.planetCircumference = this.planetRadius * 2 * Math.PI;

        while(this.currentPlayerLocation != undefined && this.currentPlayerLocation.isEqualTo(this.goal)) {
            this.goal = randomChoice(this.significantLocations);
        }
    }

    public setCurrentPlayerLocation(sl: SignificantLocation): void {
        this.currentPlayerLocation = sl;
    }

    /**
    Compute the player's current distance from the goal. This already represents
    part of the game mechanic where the player's distance computer is 
    malfunctioning and we either get a minor arc or the major arc of our
    distance from goal.
    */
    public computeDistanceFromGoal(): number {
        const havDist = this.currentPlayerLocation.haversineDistance(this.goal, this.planetRadius);

        if (Math.random() <= this.distFailureRate) {
            return this.planetCircumference - havDist;
        } else {
            return havDist;
        }
    }
}
