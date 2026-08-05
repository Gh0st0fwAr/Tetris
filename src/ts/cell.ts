import type { Tetris } from './tetris'
import AbstractCell from './abstractCell'

export class Cell extends AbstractCell {
  constructor(x: number, y: number, parentComponent: HTMLElement, tetris: Tetris) {
    super(x, y, parentComponent, tetris)
  }

  sayHello() {
    console.log(`Hello from cell ${this.x}, ${this.y}`)
  }
}
