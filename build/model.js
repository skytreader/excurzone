"use strict";
/**
Units:

- distances - kilometers
- angles - degrees
*/
var EARTH_RADIUS = 6378;
var DEG_TO_RAD = 0.0174;
function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
var SignificantLocation = /** @class */ (function () {
    function SignificantLocation(name, longitude, latitude) {
        this.name = name;
        this.longitude = longitude;
        this.latitude = latitude;
    }
    SignificantLocation.prototype.getName = function () {
        return this.name;
    };
    SignificantLocation.prototype.getLongitude = function () {
        return this.longitude;
    };
    SignificantLocation.prototype.getLatitude = function () {
        return this.latitude;
    };
    SignificantLocation.prototype.isEqualTo = function (otherSL) {
        return this.name == otherSL.name &&
            Math.abs(this.longitude - otherSL.getLongitude()) <= 0.0001 &&
            Math.abs(this.latitude - otherSL.getLatitude()) <= 0.0001;
    };
    /*
    Thanks http://www.ggspatial.co.uk/distance-on-a-sphere-the-haversine-formula/
    */
    SignificantLocation.prototype.haversineDistance = function (coord, planetRadius) {
        var lon1 = this.longitude;
        var lat1 = this.latitude;
        var lon2 = coord.getLongitude();
        var lat2 = coord.getLatitude();
        var phi1 = lat1 * DEG_TO_RAD;
        var phi2 = lat2 * DEG_TO_RAD;
        var dPhi = phi2 - phi1;
        var dLambda = (lon2 - lon1) * DEG_TO_RAD;
        var a = Math.pow(Math.sin(dPhi / 2), 2) + Math.cos(phi1) * Math.cos(phi2) * Math.pow(Math.sin(dLambda / 2), 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return planetRadius * c;
    };
    return SignificantLocation;
}());
var ExcurzoneGame = /** @class */ (function () {
    function ExcurzoneGame(significantLocations, planetRadius) {
        if (planetRadius === void 0) { planetRadius = EARTH_RADIUS; }
        this.significantLocations = significantLocations;
        this.planetRadius = planetRadius;
        this.currentPlayerLocation = randomChoice(this.significantLocations);
        this.goal = randomChoice(this.significantLocations);
        while (this.currentPlayerLocation.isEqualTo(this.goal)) {
            this.goal = randomChoice(this.significantLocations);
        }
    }
    return ExcurzoneGame;
}());
var sa = new SignificantLocation("a", -0.116773, 51.510357);
var sb = new SignificantLocation("b", -77.009003, 38.889931);
console.log(sa.haversineDistance(sb, EARTH_RADIUS));
console.log(sb.haversineDistance(sa, EARTH_RADIUS));
