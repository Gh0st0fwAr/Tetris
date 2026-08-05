import { Cell } from './cell'
import { Pivot } from './pivot'
import { randomPieceType, PIECE_SHAPES, PieceType } from './pieceType'

export enum Size {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

export type TetrisUiCallbacks = {
  onGameOver?: () => void
}

const BOARD_GAP = 2
const BOARD_PADDING = 20
const VERTICAL_PADDING = 60
const FALL_INTERVAL_MS = 1000

function calcCellSize(sizeY: number): number {
  const availableHeight = window.innerHeight - VERTICAL_PADDING
  const gapsHeight = (sizeY - 1) * BOARD_GAP
  const cellSize = Math.floor((availableHeight - gapsHeight - BOARD_PADDING) / sizeY)
  return Math.max(12, cellSize)
}

function getBoardDimensions(size: Size): { sizeX: number; sizeY: number; cellSize: number } {
  switch (size) {
    case Size.Small:
      return { sizeX: 7, sizeY: 11, cellSize: calcCellSize(11) }
    case Size.Medium:
      return { sizeX: 10, sizeY: 16, cellSize: calcCellSize(16) }
    case Size.Large:
      return { sizeX: 16, sizeY: 24, cellSize: calcCellSize(24) }
  }
}

export class Tetris {
  sizeX: number
  sizeY: number
  cellSize: number
  grid: Cell[][] = []
  board: HTMLElement
  parentComponent: HTMLElement
  activePiece: Pivot | null = null
  intervalId: ReturnType<typeof setInterval> | null = null

  private uiCallbacks: TetrisUiCallbacks
  private isRunning = false

  constructor(size: Size, parentComponent: HTMLElement, uiCallbacks: TetrisUiCallbacks = {}) {
    const { sizeX, sizeY, cellSize } = getBoardDimensions(size)

    this.sizeX = sizeX
    this.sizeY = sizeY
    this.cellSize = cellSize
    this.parentComponent = parentComponent
    this.uiCallbacks = uiCallbacks
    this.board = document.createElement('div')
    this.grid = []

    document.addEventListener('keydown', this.handleKeyDown)
    this.createBoard()
  }

  startGame(): void {
    if (this.isRunning) return

    this.isRunning = true
    this.spawnPiece()
    this.startFalling()
  }

  reset(): void {
    this.stopFalling()
    this.activePiece = null
    this.isRunning = false
    this.clearGrid()
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (!this.isRunning || this.intervalId === null) return

    switch (event.key) {
      case 'ArrowLeft':
        this.activePiece?.moveLeft()
        break
      case 'ArrowRight':
        this.activePiece?.moveRight()
        break
      case 'ArrowDown':
        if (this.activePiece?.moveDown() === false) {
          this.lockPiece()
          this.spawnPiece()
        }
        break
      case ' ':
        event.preventDefault()
        this.activePiece?.rotate()
        break
    }
  }

  private canSpawn(type: PieceType): boolean {
    const spawnX = Math.floor(this.sizeX / 2)

    return PIECE_SHAPES[type].every(({ dx, dy }) => {
      const x = spawnX + dx
      const y = dy

      if (y < 0 || y >= this.sizeY) return false
      if (x < 0 || x >= this.sizeX) return false
      if (this.grid[y][x].isBlack) return false
      return true
    })
  }

  private startFalling(): void {
    if (this.intervalId !== null) return

    this.intervalId = setInterval(() => {
      if (this.activePiece?.moveDown() === false) {
        this.lockPiece()
        this.spawnPiece()
      }
    }, FALL_INTERVAL_MS)
  }

  private stopFalling(): void {
    if (this.intervalId === null) return
    clearInterval(this.intervalId)
    this.intervalId = null
  }

  private isRowFull(y: number): boolean {
    return this.grid[y].every((cell) => cell.isBlack)
  }

  private clearRow(y: number): void {
    for (let x = 0; x < this.sizeX; x++) {
      this.grid[y][x].setBlack(false)
    }
  }

  private clearFullRows(): void {
    for (let y = this.sizeY - 1; y >= 0; y--) {
      if (!this.isRowFull(y)) continue
      this.clearRow(y)
      this.setRowsDown(y)
      y--
    }
  }

  private setRowsDown(fromY: number): void {
    for (let y = fromY; y >= 1; y--) {
      for (let x = 0; x < this.sizeX; x++) {
        this.grid[y][x].setBlack(this.grid[y - 1][x].isBlack)
      }
    }

    for (let x = 0; x < this.sizeX; x++) {
      this.grid[0][x].setBlack(false)
    }
  }

  private lockPiece(): void {
    if (this.activePiece) {
      for (const { x, y } of this.activePiece.getBlockPositions()) {
        this.grid[y][x].setBlack(true, false)
      }
    }

    this.activePiece = null
    this.clearFullRows()
  }

  private gameOver(): void {
    this.stopFalling()
    this.activePiece = null
    this.isRunning = false
    this.uiCallbacks.onGameOver?.()
  }

  private clearGrid(): void {
    for (let y = 0; y < this.sizeY; y++) {
      for (let x = 0; x < this.sizeX; x++) {
        this.grid[y][x].setBlack(false)
      }
    }
  }

  private createBoard(): void {
    this.board.classList.add('game__board')
    this.board.style.gridTemplateColumns = `repeat(${this.sizeX}, ${this.cellSize}px)`
    this.board.style.gridTemplateRows = `repeat(${this.sizeY}, ${this.cellSize}px)`
    this.parentComponent.appendChild(this.board)
    this.createCells()
  }

  private createCells(): void {
    for (let y = 0; y < this.sizeY; y++) {
      this.grid[y] = []
      for (let x = 0; x < this.sizeX; x++) {
        this.grid[y][x] = new Cell(x, y, this.board, this)
      }
    }
  }

  private spawnPiece(): void {
    const x = Math.floor(this.sizeX / 2)
    const type = randomPieceType()

    if (!this.canSpawn(type)) {
      this.gameOver()
      return
    }

    this.activePiece = new Pivot(x, 0, type, this)
    this.activePiece.spawn()
  }
}
