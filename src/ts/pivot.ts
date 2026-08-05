import type { Tetris } from './tetris'
import { PIECE_SHAPES, type Offset, type PieceType } from './pieceType'

type Position = { x: number; y: number }

export class Pivot {
  x: number
  y: number
  type: PieceType
  tetris: Tetris
  rotation = 0

  constructor(x: number, y: number, type: PieceType, tetris: Tetris) {
    this.x = x
    this.y = y
    this.type = type
    this.tetris = tetris
  }

  getOffsets(): Offset[] {
    let offsets = PIECE_SHAPES[this.type].map((offset) => ({ ...offset }))

    for (let i = 0; i < this.rotation; i++) {
      offsets = offsets.map(({ dx, dy }) => ({ dx: dy, dy: -dx }))
    }

    return offsets
  }

  getBlockPositions(): Position[] {
    return this.getOffsets().map(({ dx, dy }) => ({
      x: this.x + dx,
      y: this.y + dy,
    }))
  }

  draw(): void {
    for (const { x, y } of this.getBlockPositions()) {
      this.tetris.grid[y][x].setBlack(true, true)
    }
  }

  clear(): void {
    for (const { x, y } of this.getBlockPositions()) {
      this.tetris.grid[y][x].setBlack(false)
    }
  }

  spawn(): void {
    this.draw()
  }

  private canMoveWith(apply: () => void, revert: () => void): boolean {
    const currentPositions = this.getBlockPositions()
    apply()

    const canMove = this.getBlockPositions().every(({ x, y }) => {
      const isOwnCell = currentPositions.some(
        ({ x: oldX, y: oldY }) => oldX === x && oldY === y,
      )

      if (y < 0 || y >= this.tetris.sizeY) return false
      if (x < 0 || x >= this.tetris.sizeX) return false
      if (this.tetris.grid[y][x].isBlack && !isOwnCell) return false
      return true
    })

    revert()
    return canMove
  }

  canMoveDown(): boolean {
    const savedY = this.y
    return this.canMoveWith(
      () => { this.y = savedY + 1 },
      () => { this.y = savedY },
    )
  }

  canMoveLeft(): boolean {
    const savedX = this.x
    return this.canMoveWith(
      () => { this.x = savedX - 1 },
      () => { this.x = savedX },
    )
  }

  canMoveRight(): boolean {
    const savedX = this.x
    return this.canMoveWith(
      () => { this.x = savedX + 1 },
      () => { this.x = savedX },
    )
  }

  canRotate(): boolean {
    const savedRotation = this.rotation
    return this.canMoveWith(
      () => { this.rotation = (this.rotation + 1) % 4 },
      () => { this.rotation = savedRotation },
    )
  }

  private moveIf(canMove: () => boolean, move: () => void): boolean {
    if (!canMove()) return false
    this.clear()
    move()
    this.draw()
    return true
  }

  moveDown(): boolean {
    return this.moveIf(() => this.canMoveDown(), () => { this.y++ })
  }

  moveLeft(): boolean {
    return this.moveIf(() => this.canMoveLeft(), () => { this.x-- })
  }

  moveRight(): boolean {
    return this.moveIf(() => this.canMoveRight(), () => { this.x++ })
  }

  rotate(): boolean {
    return this.moveIf(
      () => this.canRotate(),
      () => { this.rotation = (this.rotation + 1) % 4 },
    )
  }
}
