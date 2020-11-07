import Phaser from 'phaser';
import {SignificantLocation, ExcurzoneGame} from './model';

const PARENT_ID = "excurzone-target";

const CONTAINER_BG = 0x1c1c1c;
const GRID_FILL = 0x383838;
const GRID_LINES = 0x384438;

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
    constructor(
        private gameModel: ExcurzoneGame
    ) {
        super(configMaker({key: "main"}));
    }

    private preload(): void {
        this.load.image("topography", "img/contours.png");
    }

    private createInterfaceRect(): void {
        this.add.rectangle(
            Math.floor(this.cameras.main.displayWidth * 0.08),
            this.cameras.main.centerY,
            Math.floor(this.cameras.main.displayWidth * 0.15),
            this.cameras.main.displayHeight - 100,
            CONTAINER_BG,
            60
        );
    }

    private create(): void {
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

        this.createInterfaceRect();
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
