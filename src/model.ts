/**
Units:

- distances - kilometers
- angles - degrees 
*/

const EARTH_RADIUS: number = 6378;
const DEG_TO_RAD: number = 0.0174;

function randRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

export class Coordinate {
    constructor(
        private longitude: number,
        private latitude: number
    ){}

    public getLongitude(): number {
        return this.longitude;
    }

    public getLatitude(): number {
        return this.latitude;
    }

    public isEqualTo(otherCoord: Coordinate): boolean {
        return Math.abs(this.longitude - otherCoord.getLongitude()) <= 0.0001 &&
               Math.abs(this.latitude - otherCoord.getLatitude()) <= 0.0001;
    }

    /*
    Thanks http://www.ggspatial.co.uk/distance-on-a-sphere-the-haversine-formula/
    */
    public haversineDistance(coord: Coordinate, planetRadius: number): number {
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

    /*
    Thanks https://stackoverflow.com/a/1185413/777225 with modifications for the
    projection I want.
    */
    public cartesianProjection(planetRadius: number): number[] {
        const latRad = this.latitude * DEG_TO_RAD;
        const lonRad = this.longitude * DEG_TO_RAD;
        const x = planetRadius * Math.cos(latRad) * Math.cos(lonRad);
        // This is actually the z-axis from the answer
        const z = planetRadius * Math.sin(latRad);
        return [x, z];
    }
}

export class SignificantLocation {
    private isRevealed: boolean;
    constructor(
        private location: Coordinate,
        private correctsRadar: boolean,
        private counterAttacks: boolean
    ){
        this.isRevealed = false;
    }

    public getLocation() {
        return this.location;
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
        return this.location.isEqualTo(otherSL.getLocation()) &&
               (this.correctsRadar && otherSL.getCorrectsRadar()) &&
               (this.counterAttacks && otherSL.getCounterAttacks()) &&
               (this.isRevealed && otherSL.getIsRevealed());
    }
}

class CoordinateGenerator {
    private precisionFactor: number;
    private scaleFactor: number;
    constructor(
        p: number
    ){
        this.precisionFactor = Math.pow(10, p);
        this.scaleFactor = Math.pow(10, p - 1);
    }

    private randomCoordinate(): number {
        return randRange(-180 * this.precisionFactor, 180 * this.precisionFactor) / this.scaleFactor;
    }

    private randomLongitude(): number {
        return this.randomCoordinate();
    }
    
    private randomLatitude(): number {
        return this.randomCoordinate() / 2;
    }

    public generateCoordinate(): Coordinate {
        return new Coordinate(this.randomLongitude(), this.randomLatitude());
    }
}

class SignificantLocationGenerator {
    private coordinateGenerator: CoordinateGenerator;
    constructor(
        private radarCorrectorRate: number,
        private counterAttackerRate: number
    ){
        this.coordinateGenerator = new CoordinateGenerator(7);
    }

    public generateSignificantLocations(count: number): SignificantLocation[] {
        const locs: SignificantLocation[] = [];
        for (var i = 0; i < count; i++){
            locs.push(new SignificantLocation(
                this.coordinateGenerator.generateCoordinate(),
                Math.random() <= this.radarCorrectorRate,
                Math.random() <= this.counterAttackerRate
            ));
        }
        return locs;
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
    private currentPlayerLocation: Coordinate;
    private planetCircumference: number;
    
    private isRadarFixed: boolean;

    constructor(
        private bases: SignificantLocation[],
        private planetRadius: number = EARTH_RADIUS,
        private distFailureRate: number = 0.5 // TODO Ensure it is always in [0, 1]
    ){
        const theFate: CoordinateGenerator = new CoordinateGenerator(7);
        this.currentPlayerLocation = theFate.generateCoordinate();
        this.planetCircumference = this.planetRadius * 2 * Math.PI;
        this.isRadarFixed = false;
    }

    public getCurrentPlayerLocation(): Coordinate {
        return this.currentPlayerLocation;
    }

    public setCurrentPlayerLocation(coord: Coordinate): void {
        this.currentPlayerLocation = coord;
    }

    public getPlanetRadius(): number {
        return this.planetRadius;
    }

    public changeBaseVisibility(index: number, isVisible: boolean): void {
        this.bases[i].setIsRevealed(isVisible);
    }

    /**
    Compute the player's current distance from all . This already represents
    part of the game mechanic where the player's distance computer is 
    malfunctioning and we either get a minor arc or the major arc of our
    distance from goal. Of course, radar repairs are reflected as well.

    @return A parallel array signifying distances from bases.
    */
    public computeDistanceFromBases(): number[] {
        const distances: number[] = []
        const limit: number = this.bases.length;

        for (var i = 0; i < limit; i++) {
            const havDist = this.currentPlayerLocation.haversineDistance(this.bases[i].getLocation(), this.planetRadius);

            if (!this.isRadarFixed && Math.random() <= this.distFailureRate) {
                distances.push(this.planetCircumference - havDist);
            } else {
                distances.push(havDist);
            }
        }

        return distances;
    }
}
