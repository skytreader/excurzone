import Phaser from 'phaser';
import {Coordinate, SignificantLocation, SignificantLocationGenerator, ExcurzoneGame} from './model';
import {ExkurCounterdefense, LinearExkurCounterdefense} from './livemodels';

const PARENT_ID: string = "excurzone-target";

const CONTAINER_BG: number = 0x1c1c1c;
const GRID_FILL: number = 0x383838;
const GRID_LINES: number = 0x384438;
const FARBE_DER_DRINGLICHKEIT: number = 0xff0000;
const COOLNESS: number = 0x598bd4;

const INITIAL_INSTRUCTIONS: string = `
You have arrived at your assignment: a planet held captive by the evil Exkur
Empire. Observing from a covert location at the atmosphere, you send your
sabotage probe to destroy military outposts and free the planet. Unfortunately,
the rebellion's intelligence and equipment is lacking. Can you destroy all the
bases before the The Empire's counterdefense detects your presence?

CLICK TO START MISSION
`

const BASES_INSTRUCTIONS: string = `
These are the bases that our probe discovered with probable distances from
current location. Which would you like to attack?
`

function gid(id: string): HTMLElement | null {
    return document.getElementById(id);
}

function configMaker(customKeys: {[index: string]: any} ): Phaser.Types.Core.GameConfig {
    const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: PARENT_ID,
        physics: {
            default: "arcade",
            arcade: {
                gravity: {y: 200}
            }
        }
    }

    for (const key of Object.keys(customKeys)) {
        // @ts-ignore
        config[key] = customKeys[key];
    }

    return config;
}

// TODO Feel like these are the same. If the interface is visible then it it
// clickable. Kein Unterschied!
class GameUIState {
    constructor(
        public playerInterfaceVisible: boolean,
        public isInterfaceRectClickable: boolean
    ){}
}

const BASE_STATE = new GameUIState(true, true);

class ExcurzoneMain extends Phaser.Scene {
    protected gameUIState: GameUIState = BASE_STATE;
    // @ts-ignore FIXME later
    protected gameModel: ExcurzoneGame;
    // @ts-ignore
    protected playerCursor: Phaser.GameObjects.Arc;
    // @ts-ignore
    protected playerPulse: Phaser.GameObjects.Arc;

    protected isPlayerDead: boolean = false;
    static PLAYER_RADIUS: number = 4;

    private preload(): void {
        this.load.image("topography", "img/contours.png");
    }

    protected writeText(): void {
    }

    protected coordsToGameCartesian(c: Coordinate): number[] {
        const coordCartesian: number[] = c.cartesianProjection(this.gameModel.getPlanetRadius());
        // Remember we are scaling from the origin
        const xScaleFactor = this.cameras.main.centerX / this.gameModel.getPlanetRadius();
        const yScaleFactor = this.cameras.main.centerY / this.gameModel.getPlanetRadius();
        
        // Don't forget to translate since 0,0 for computers is the upper left corner
        const xScale = coordCartesian[0] * xScaleFactor + this.cameras.main.centerX;
        const yScale = coordCartesian[1] * yScaleFactor + this.cameras.main.centerY;
        return [xScale, yScale];

    }

    private addPlayerKurzor(): void {
        const playerCartesian: number[] = this.coordsToGameCartesian(this.gameModel.getCurrentPlayerLocation());
        const pulseCirRadius: number = ExcurzoneMain.PLAYER_RADIUS* 30;
        this.playerPulse = this.add.circle(
            playerCartesian[0],
            playerCartesian[1],
            pulseCirRadius,
            this.isPlayerDead ? FARBE_DER_DRINGLICHKEIT : 0x53c50c,
            0
        );
        this.playerPulse.setStrokeStyle(2, this.isPlayerDead ? FARBE_DER_DRINGLICHKEIT : 0x53c50c);
        this.playerCursor = this.add.circle(
            playerCartesian[0],
            playerCartesian[1],
            ExcurzoneMain.PLAYER_RADIUS,
            this.isPlayerDead ? FARBE_DER_DRINGLICHKEIT : 0x538b0c,
            undefined
        );
        // Relation to pulseCir?
        const pulseTravelTime = 4000;
        this.tweens.add({
            targets: this.playerPulse,
            scaleX: 0.001,
            scaleY: 0.001,
            yoyo: false,
            repeat: -1,
            duration: pulseTravelTime,
            hold: pulseTravelTime / 2,
            ease: 'Sine.easeInOut'
        });
    }

    protected updatePlayerKurzor(): void {
        const playerCartesian: number[] = this.coordsToGameCartesian(this.gameModel.getCurrentPlayerLocation());
        this.playerPulse.x = playerCartesian[0];
        this.playerPulse.y = playerCartesian[1];
        this.playerPulse.fillColor = this.isPlayerDead ? FARBE_DER_DRINGLICHKEIT : 0x53c50c;
        this.playerPulse.setStrokeStyle(2, this.isPlayerDead ? FARBE_DER_DRINGLICHKEIT : 0x53c50c);
        this.playerCursor.x = playerCartesian[0];
        this.playerCursor.y = playerCartesian[1];
        this.playerCursor.fillColor = this.isPlayerDead ? FARBE_DER_DRINGLICHKEIT : 0x538b0c;
    }

    private addMap(): void {
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "topography");
        this.add.grid(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            this.cameras.main.displayWidth,
            this.cameras.main.displayHeight,
            100,
            100,
            GRID_FILL,
            70,
            GRID_LINES,
            undefined
        );
    }

    private addBasicUIElements(): void {
        // The map
        this.addMap();

        // The map overlays
        this.addPlayerKurzor();
    }

    protected createInterfaceRect(clickHandler?: Function): void {
        const rectYOffset = 100;
        if (this.gameUIState.playerInterfaceVisible) {
            const rect = this.add.rectangle(
                this.cameras.main.centerX,
                this.cameras.main.centerY,
                Math.floor(this.cameras.main.displayWidth * 0.8),
                this.cameras.main.displayHeight - rectYOffset,
                CONTAINER_BG,
                60
            );
            rect.setInteractive(new Phaser.Geom.Rectangle(
                0, 0, rect.width, rect.height
            ), Phaser.Geom.Rectangle.Contains);
            if (clickHandler != null || clickHandler != undefined){
                rect.on("pointerdown", clickHandler);
            }
        }
    }

    protected create(): void {
        console.log("In main create", this.gameUIState);
        this.addBasicUIElements();
    }

    public update(): void {
    }
}

class Intro extends ExcurzoneMain {
    constructor() {
        super(configMaker({key: "intro"}));
        this.gameUIState.playerInterfaceVisible = true;
        this.gameUIState.isInterfaceRectClickable = true;
    }

    private init(data: any): void {
        const slGenerator = new SignificantLocationGenerator(0.4, 0.3);
        this.gameModel = new ExcurzoneGame(slGenerator.generateSignificantLocations(10));
        this.time.paused = true;
    }

    protected create(): void {
        super.create();
        // The player controls/spaceship interface.
        this.createInterfaceRect((pointer:any) => {this.rectClick(pointer)});
        if (this.gameUIState.playerInterfaceVisible) {
            this.writeText();
        }
    }

    protected writeText(): void {
        const rectYOffset = 100;
        this.add.text(
            this.cameras.main.centerX / 2,
            rectYOffset + 8,
            INITIAL_INSTRUCTIONS
        );
    }

    private rectClick(pointer: any): void {
        this.scene.start("maingame", {gameModel: this.gameModel, uiState: this.gameUIState});
    }
}

class MainGame extends ExcurzoneMain {
    // @ts-ignore FIXME initialization
    private timedEvent: Phaser.Time.Clock;
    // @ts-ignore FIXME initialization
    private timeText: Phaser.GameObjects.Text;
    // @ts-ignore FIXME initialization
    private radarStatus: Phaser.GameObjects.Text;
    // @ts-ignore FIXME initialization
    private travelStatus: Phaser.GameObjects.Text;
    private currentDestination: number = -1;
    // @ts-ignore FIXME initialization
    private baseChoices: Phaser.GameObjects.Text[] = [];
    private probeInTransit: boolean = false;
    private currentKnownDistances: number[] = [];

    // Hack because I can't get the timer to stay still in the intro
    private timeOffset: number = 0;
    private counterdefense: ExkurCounterdefense;

    private lastCounterdefenseCheck: number = 0;

    static COUNTERDEFENSE_PERIOD: number = 13000;

    constructor(){
        super(configMaker({key: "maingame"}));
        this.counterdefense = new LinearExkurCounterdefense();
        console.log("Main game constructed");
    }

    public init(data: any): void {
        console.log("Main game initializing");
        this.gameModel = data.gameModel;
        this.gameUIState = data.uiState;
        this.gameUIState.playerInterfaceVisible = false;
        this.gameUIState.isInterfaceRectClickable = false;
        this.time.paused = false;
    }

    private getTimeInScene(): number {
        return this.time.now - this.timeOffset;
    }

    private createBaseDisplayText(baseDistances: number[], baseIndex: number): string {
        if (this.gameModel.getCurrentPlayerLocation().isEqualTo(this.gameModel.getBase(baseIndex).getLocation())) {
            return "ABCDEFGHIJ".charAt(baseIndex) + ": CURRENT LOCATION";
        } else {
            return (
                "ABCDEFGHIJ".charAt(baseIndex) + ": " +
                baseDistances[baseIndex].toFixed(3) + "km" +
                (this.gameModel.getBase(baseIndex).getIsRevealed() ? " [REACHED]" : "")
            );
        }
    }

    private updateDistanceListing(): void {
        const baseDistances: number[] = this.gameModel.computeDistanceFromBases();
        for (var i = 0; i < this.gameModel.getBaseCount(); i++) {
            const base: SignificantLocation = this.gameModel.getBase(i);
            this.baseChoices[i].setText(this.createBaseDisplayText(baseDistances, i));
            this.baseChoices[i].setFontStyle(this.gameModel.getBase(i).getIsRevealed() ? "bold" : "");
            if (this.gameModel.getBase(i).getIsRevealed()){
                console.log(COOLNESS.toString(16));
                this.baseChoices[i].setColor("#" + COOLNESS.toString(16));
            }
        }
    }

    protected writeText(): void {
        const xAlign: number = this.cameras.main.displayWidth * 0.08;
        const instructions = this.add.text(
            xAlign,
            108,
            BASES_INSTRUCTIONS
        );
        let runningHeight = instructions.height + 108;
        const baseDistances: number[] = this.gameModel.computeDistanceFromBases();
        for (var i = 0; i < this.gameModel.getBaseCount(); i++) {
            const base: SignificantLocation = this.gameModel.getBase(i);
            this.baseChoices[i] = this.add.text(
                xAlign,
                runningHeight + 13,
                this.createBaseDisplayText(baseDistances, i),
                {
                    fontSize: 20,
                    // FIXME No need to already decide here
                    color: this.gameModel.getBase(i).getIsRevealed() ? COOLNESS : "#fff",
                    fontStyle: (this.currentDestination == i) ? "bold" : ""
                }
            );
            this.baseChoices[i].setInteractive(new Phaser.Geom.Rectangle(
                0, 0, this.baseChoices[i].width, this.baseChoices[i].height,
            ), Phaser.Geom.Rectangle.Contains);
            // Hack because somehow i seems to fall out of scope on callback
            // no matter what I do.
            const index = i;
            this.baseChoices[i].on("pointerdown", (pointer: any) => {
                this.currentDestination = index;
                this.probeInTransit = true;
                this.time.delayedCall(
                    Math.floor(baseDistances[index]), () => {this.setPlayerLoc(index)}, [], this
                );
            });
            runningHeight += this.baseChoices[i].height;
        }
    }

    private addBaseMarker(baseCartesianCoords: number[]): void {
        this.add.circle(
            baseCartesianCoords[0],
            baseCartesianCoords[1],
            ExcurzoneMain.PLAYER_RADIUS * 2,
            COOLNESS,
            undefined
        );
    }

    private setPlayerLoc(i: number): void {
        if (!this.isPlayerDead) {
            const base: Coordinate = this.gameModel.getBase(i).getLocation();
            const baseCartesian: number[] = this.coordsToGameCartesian(base);
            this.addBaseMarker(baseCartesian);
            this.gameModel.setCurrentPlayerLocation(base);
            this.updatePlayerKurzor();
            this.probeInTransit = false;
            this.gameModel.getBase(i).setIsRevealed(true);
            this.updateDistanceListing();
        }
    }

    private createTimerLabel(): string {
        if (this.timeOffset == 0){
            this.timeOffset = this.time.now;
        }
        return "MISSION TIME: " + Math.floor(this.getTimeInScene() / 1000) + "cyc|ESF"
    }

    private addTimer(): void {
        this.time.paused = false;
        this.timeText = this.add.text(
            this.cameras.main.displayWidth * 0.8,
            36,
            this.createTimerLabel(),
            {
                fontSize: 21,
                color: "#f00",
                fontStyle: "bold"
            }
        );
    }

    private addRadarStatus(): void {
        if (this.radarStatus == null){
            this.radarStatus = this.add.text(
                this.cameras.main.displayWidth * 0.8,
                36 + this.timeText.height,
                "RADAR: " + (this.gameModel.getIsRadarFixed() ? "FIXED" : "UNRELIABLE"),
                {
                    fontSize: 21,
                    color: this.gameModel.getIsRadarFixed() ? COOLNESS : "#f00",
                    fontStyle: "bold"
                }
            );
        } else {
            this.radarStatus.setText("RADAR: " + (this.gameModel.getIsRadarFixed() ? "FIXED" : "UNRELIABLE"));
        }
    }

    private addTravelStatus(): void {
        if (this.travelStatus == null){
            this.travelStatus = this.add.text(
                this.cameras.main.displayWidth * 0.8,
                36 + this.timeText.height + this.radarStatus.height,
                "PROBE: " + (this.probeInTransit ? "IN TRANSIT TO " + "ABCDEFGHIJ".charAt(this.currentDestination) : "STEADY"),
                {
                    fontSize: 21,
                    color: "#598bd4",
                    fontStyle: "bold"
                }
            );
        } else {
            this.travelStatus.setText("PROBE: " + (this.probeInTransit ? "IN TRANSIT TO " + "ABCDEFGHIJ".charAt(this.currentDestination) : "STEADY"));
        }
    }

    protected create(): void {
        super.create();
        this.playerCursor.depth = 100;
        this.playerPulse.depth = 100;
        this.writeText();
        // These guys are "bunched" together. Perhaps they could be an HTML
        // Element instead?
        this.addTimer();
        this.addRadarStatus();
        this.addTravelStatus();
    }

    private counterDefenseCheck(): void {
        const cdfCheck = this.counterdefense.hasCaught(this.getTimeInScene());
        this.lastCounterdefenseCheck = this.getTimeInScene();

        if (cdfCheck){
            // GAME OVER
            this.setGameOver();
            console.log("GAME OVER!");
        } else {
            this.flashWarning();
        }
    }
    
    public update(): void {
        if (!this.isPlayerDead) {
            this.timeText.setText(this.createTimerLabel());
            // FIXME This would benefit from a proper timer.
            if ((this.getTimeInScene() - this.lastCounterdefenseCheck) > MainGame.COUNTERDEFENSE_PERIOD) {
                this.counterDefenseCheck();
            }
            this.addRadarStatus();
            this.addTravelStatus();
        }
    }

    private setGameOver(): void {
        const warnText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.displayHeight * 0.9,
            "THE EXKURS CAUGHT OUR PROBE",
            {
                fontSize: 36,
                color: "#f00",
                fontStyle: "bold"
            }
        );
        this.isPlayerDead = true;
        // Just for the color change.
        this.updatePlayerKurzor();
    }

    private flashWarning(): void {
        const achtung = this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            this.cameras.main.displayWidth,
            this.cameras.main.displayHeight,
            FARBE_DER_DRINGLICHKEIT,
            undefined
        );
        this.tweens.add({
            targets: achtung,
            alpha: 0,
            yoyo: false,
            repeat: 3,
            duration: Math.floor(2000 / 3),
            hold: 500,
            ease: "Sine.easeInOut"
        });
        const warnText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.displayHeight * 0.9,
            "ACHTUNG! EXKUR COUNTERDEFENSE IS ON TO US!",
            {
                fontSize: 36,
                color: "#0f0",
                fontStyle: "bold"
            }
        );
        this.tweens.add({
            targets: warnText,
            alpha: 0,
            yoyo: false,
            repeat: 0,
            duration: 4000,
            ease: "Sine.easeInOut"
        });
    }
}

export var game: Phaser.Game;

// HAHAHA LOL ROFL
window.onresize = (event: Event) => {
    const parent: HTMLElement | null = gid(PARENT_ID);
    if (parent != null) {
        game.scale.resize(parent.offsetWidth - 2, parent.offsetHeight - 2);
    }
};

window.onload = (event: Event) => {
    const scenesConfig = {"scene": [Intro, MainGame]};
    game = new Phaser.Game(configMaker(scenesConfig));
    // @ts-ignore
    window.onresize(event);
}
