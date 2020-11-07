import Phaser from 'phaser';
import {SignificantLocation, ExcurzoneGame} from './model';

const PARENT_ID = "excurzone-target";

function gid(id: string): HTMLElement | null {
    return document.getElementById(id);
}

function newNode(tag: string): HTMLElement {
    return document.createElement(tag);
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
    ) {
        super(configMaker({key: "main"}));
    }

    private setupGrid(colCount: number, rowCount: number, gridUpperLeftX: number, gridUpperLeftY: number): void {
        const cellWidth = Math.floor((this.cameras.main.displayWidth - (gridUpperLeftX * 2)) / colCount);
        const cellHeight = Math.floor((this.cameras.main.displayHeight - (gridUpperLeftY * 2)) / rowCount);
        this.add.grid(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            this.cameras.main.displayWidth,
            this.cameras.main.displayHeight,
            100,
            100,
            0x383838,
            undefined,
            0x384438,
            undefined
        );
    }

    private preload(): void {
        this.load.image("topography", "img/contours.png");
    }

    private create(): void {
        this.setupGrid(10, 4, 100, 0);
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "topography");
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
    const scenesConfig = {"scene": [ExcurzoneMain]};
    game = new Phaser.Game(configMaker(scenesConfig));
    // @ts-ignore
    window.onresize(event);
}
