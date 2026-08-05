import type { Tetris } from './tetris'

export default class AbstractCell {
  x: number
  y: number
  isBlack: boolean = false
  tetris: Tetris
  parentComponent: HTMLElement
  element: HTMLElement

  constructor(x: number, y: number, parentComponent: HTMLElement, tetris: Tetris) {
    this.x = x
    this.y = y
    this.tetris = tetris
    this.parentComponent = parentComponent

    const cell = document.createElement('div')
    cell.classList.add('board__cell')
    this.element = cell
    this.parentComponent.appendChild(cell)
  }

  setBlack(isBlack: boolean): void {
    this.isBlack = isBlack
    this.element.style.setProperty('background-color', isBlack ? '#000' : '#fff', 'important')
  }
}
