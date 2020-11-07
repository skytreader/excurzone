import Phaser from 'phaser';
import {SignificantLocation, ExcurzoneGame} from './model';

function gid(id: string): HTMLElement | null {
    return document.getElementById(id);
}

function newNode(tag: string): HTMLElement {
    return document.createElement(tag);
}

class ExcurzoneController {
    private targetBoard: HTMLElement | null;
    constructor(
        private gameModel: ExcurzoneGame
    ) {
        this.targetBoard = gid("excurzone-target");
        if (this.targetBoard != null){
            for (var i = 0; i < 40; i++){
                this.targetBoard.appendChild(newNode("div"));
            }
        }
    }
}

window.onload = () => {
    new ExcurzoneController(new ExcurzoneGame([]));
};
