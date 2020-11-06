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

class SignificantLocation {
    constructor(
        private name: string,
        private longitude: number,
        private latitude: number
    ){}

    public getName(): string {
        return this.name;
    }

    public getLongitude(): number {
        return this.longitude;
    }

    public getLatitude(): number {
        return this.latitude;
    }

    public isEqualTo(otherSL: SignificantLocation): boolean {
        return this.name == otherSL.name &&
               Math.abs(this.longitude - otherSL.getLongitude()) <= 0.0001 &&
               Math.abs(this.latitude - otherSL.getLatitude()) <= 0.0001;
    }

    /*
    Thanks http://www.ggspatial.co.uk/distance-on-a-sphere-the-haversine-formula/
    */
    public haversineDistance(coord: SignificantLocation, planetRadius: number): number {
        const lon1 = this.longitude;
        const lat1 = this.latitude;
        const lon2 = coord.getLongitude();
        const lat2 = coord.getLongitude();

        const planetRadiusKM = planetRadius / 1000;
        const phi1 = lat1 * DEG_TO_RAD;
        const phi2 = lat2 * DEG_TO_RAD;

        const dPhi = phi2 - phi1;
        const dLambda = (lon2 - lon1) * DEG_TO_RAD;

        const a = Math.pow(Math.sin(dPhi / 2), 2) + Math.cos(phi1) * Math.cos(phi2) * Math.pow(Math.sin(dLambda / 2), 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        // Answer in meters but our convention is in km.
        return (planetRadius * c) / 1000;
    }
}

class ExcurzoneGame {
    private currentPlayerLocation: SignificantLocation;
    private goal: SignificantLocation;
    constructor(
        private significantLocations: SignificantLocation[],
        private planetRadius: number = EARTH_RADIUS
    ){
        this.currentPlayerLocation = randomChoice(this.significantLocations);
        this.goal = randomChoice(this.significantLocations);

        while(this.currentPlayerLocation.isEqualTo(this.goal)) {
            this.goal = randomChoice(this.significantLocations);
        }
    }
}

const sa = new SignificantLocation("a", -0.116773, 51.510357);
const sb = new SignificantLocation("b", -77.009003, 38.889931);

console.log(sa.haversineDistance(sb, EARTH_RADIUS));
console.log(sb.haversineDistance(sa, EARTH_RADIUS));
