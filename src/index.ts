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

class ExcurzoneMain extends Phaser.Scene {
    private playerInterfaceVisible: boolean;
    constructor(
        private gameModel: ExcurzoneGame
    ) {
        super(configMaker({key: "main"}));
        this.playerInterfaceVisible = true;
    }

    private preload(): void {
        this.load.image("topography", "img/contours.png");
    }

    private createInterfaceRect(): void {
        const rectYOffset = 100;
        this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            Math.floor(this.cameras.main.displayWidth * 0.8),
            this.cameras.main.displayHeight - rectYOffset,
            CONTAINER_BG,
            60
        );
    }

    private writeText(): void {
        const rectYOffset = 100;
        this.add.text(
            this.cameras.main.centerX / 2,
            rectYOffset + 8,
            INITIAL_INSTRUCTIONS
        );
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

        // The player controls/spaceship interface.
        this.createInterfaceRect();
    }

    private create(): void {
        this.addBasicUIElements();
        this.writeText();
    }

    public update(): void {
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
    const scenesConfig = {"scene": [new ExcurzoneMain(new ExcurzoneGame([]))]};
    game = new Phaser.Game(configMaker(scenesConfig));
    // @ts-ignore
    window.onresize(event);
}
