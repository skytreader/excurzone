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
        width: 1024,
        height: 768,
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
        const cellWidth = Math.floor(this.cameras.main.width / colCount);
        const cellHeight = Math.floor(this.cameras.main.height / rowCount);

        for (var row = 0; row < rowCount; row++) {
            for (var col = 0; col < colCount; col++){
                const rect = this.add.rectangle(col * cellWidth + gridUpperLeftX, row * cellHeight + gridUpperLeftY, cellWidth, cellHeight, 0x0000ff);
                rect.setStrokeStyle(2, 0x00ff00);
            }
        }
    }

    private preload(): void {}

    private create(): void {
        this.setupGrid(10, 4, 100, 0);
    }

    private update(): void {
    }
}

export const game: Phaser.Game;

// HAHAHA LOL ROFL
window.onresize = (event) => {
    const parent: HTMLElement | null = gid(PARENT_ID);
    game.scale.resize(parent.offsetWidth - 2, parent.offsetHeight - 2);
});

window.onload = (event) => {
    const scenesConfig = {"scene": [ExcurzoneMain]};
    game = new Phaser.Game(configMaker(scenesConfig));
    window.onresize(event);
}
