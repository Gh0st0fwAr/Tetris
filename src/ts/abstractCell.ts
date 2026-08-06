import type { Tetris } from './tetris'

const CLEAR_STAGGER_MS = 45

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
    cell.classList.add('game__cell')
    this.element = cell
    this.parentComponent.appendChild(cell)
  }

  setBlack(isBlack: boolean, isActive = false): void {
    if (!isBlack) {
      this.resetClearAnimation()
    }

    this.isBlack = isBlack
    this.element.classList.toggle('game__cell--filled', isBlack && !isActive)
    this.element.classList.toggle('game__cell--active', isBlack && isActive)
  }

  playClearAnimation(staggerIndex: number): void {
    this.element.style.setProperty('--clear-stagger', `${staggerIndex * CLEAR_STAGGER_MS}ms`)
    this.element.classList.add('game__cell--clearing')
  }

  resetClearAnimation(): void {
    this.element.classList.remove('game__cell--clearing')
    this.element.style.removeProperty('--clear-stagger')
  }
}
