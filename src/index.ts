import Phaser from 'phaser';
import {SignificantLocation, ExcurzoneGame} from './model';
import {LinearExkurCounterdefense} from './livemodels';

const PARENT_ID = "excurzone-target";

const CONTAINER_BG = 0x1c1c1c;
const GRID_FILL = 0x383838;
const GRID_LINES = 0x384438;

const INITIAL_INSTRUCTIONS: string = `
You have arrived at your assignment: a planet held captive by the evil Exkur
Empire. Observing from a covert location at the atmosphere, you send your
sabotage probe to destroy military outposts and free the planet. Unfortunately,
the rebellion's intelligence and equipment is lacking. Can you destroy all the
bases before the The Empire's counterdefense detects your presence?

CLICK TO START MISSION
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

    private preload(): void {
        this.load.image("topography", "img/contours.png");
    }

    protected writeText(): void {
    }

    private computeScaledPlayerLocation(): number[] {
        const playerCartesian: number[] = this.gameModel.getCurrentPlayerLocation().cartesianProjection(this.gameModel.getPlanetRadius());
        // Remember we are scaling from the origin
        const xScaleFactor = this.cameras.main.centerX / this.gameModel.getPlanetRadius();
        const yScaleFactor = this.cameras.main.centerY / this.gameModel.getPlanetRadius();
        
        // Don't forget to translate since 0,0 for computers is the upper left corner
        const xPlayerScale = playerCartesian[0] * xScaleFactor + this.cameras.main.centerX;
        const yPlayerScale = playerCartesian[1] * yScaleFactor + this.cameras.main.centerY;
        return [xPlayerScale, yPlayerScale];
    }

    private addPlayerKurzor(): void {
        const playerCartesian: number[] = this.computeScaledPlayerLocation();
        const playerRadius: number = 4;
        const pulseCirRadius: number = playerRadius * 30;
        const pulseCir = this.add.circle(
            playerCartesian[0],
            playerCartesian[1],
            pulseCirRadius,
            0x53c50c,
            0
        );
        pulseCir.setStrokeStyle(2, 0x53c50c);
        const playerCircle = this.add.circle(
            playerCartesian[0],
            playerCartesian[1],
            playerRadius,
            0x538b0c,
            undefined
        );
        // Relation to pulseCir?
        const pulseTravelTime = 4000;
        this.tweens.add({
            targets: pulseCir,
            scaleX: 0.001,
            scaleY: 0.001,
            yoyo: false,
            repeat: -1,
            duration: pulseTravelTime,
            hold: pulseTravelTime / 2,
            ease: 'Sine.easeInOut'
        });
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
        console.log("In main is interface now visible", this.gameUIState.playerInterfaceVisible);
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
        this.gameModel = new ExcurzoneGame([]);
        this.time.pause = true;
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
        this.scene.start("choosing", {gameModel: this.gameModel, uiState: this.gameUIState});
    }
}

// What a horrible class name
class BaseChoosing extends ExcurzoneMain {
    private timedEvent: Phaser.Time.Clock;
    private timeText: Phaser.GameObjects.Text;

    // Hack because I can't get the timer to stay still in the intro
    private timeOffset: number = 0;
    constructor(){
        super(configMaker({key: "choosing"}));
    }

    public init(data: any): void {
        this.gameModel = data.gameModel;
        this.gameUIState = data.uiState;
        this.gameUIState.playerInterfaceVisible = false;
        this.gameUIState.isInterfaceRectClickable = false;
        console.log("In BaseChoosing", this.time.now, this.timeOffset);
    }

    private createTimerLabel(): string {
        if (this.timeOffset == 0){
            this.timeOffset = this.time.now;
        }
        return "MISSION TIME: " + Math.floor((this.time.now - this.timeOffset) / 1000) + "cyc|ESF"
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

    protected create(): void {
        console.log("BaseChoosing create");
        super.create();
        this.addTimer();
    }
    
    public update(): void {
        this.timeText.setText(this.createTimerLabel());
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
    const scenesConfig = {"scene": [Intro, BaseChoosing]};
    game = new Phaser.Game(configMaker(scenesConfig));
    // @ts-ignore
    window.onresize(event);
}
