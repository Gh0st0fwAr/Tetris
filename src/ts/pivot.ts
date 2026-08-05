import type { Tetris } from './tetris'
import { PIECE_SHAPES, type Offset, type PieceType } from './pieceType'

export class Pivot {
  x: number
  y: number
  type: PieceType
  tetris: Tetris
  rotation: number = 0

  constructor(x: number, y: number, type: PieceType, tetris: Tetris) {
    this.x = x
    this.y = y
    this.type = type
    this.tetris = tetris
  }

  /**
   * Возвращает 4 смещения (dx, dy) с учётом текущего поворота.
   *
   * rotation = 0 → форма как в PIECE_SHAPES (без поворота)
   * rotation = 1 → повернули на 90° по часовой
   * rotation = 2 → на 180°
   * rotation = 3 → на 270°
   *
   * Математика здесь простая, без sin/cos:
   * один поворот на 90° по часовой заменяет (dx, dy) на (dy, -dx).
   *
   * Пример на пальцах:
   * блок был на 1 клетку НИЖЕ pivot → dx=0, dy=1
   * после поворота он на 1 клетку СПРАВА → dx=1, dy=0
   * подставляем в формулу: новый dx = dy = 1, новый dy = -dx = 0 ✓
   */
  getOffsets(): Offset[] {
    // Копируем массив, чтобы не менять исходный PIECE_SHAPES
    let offsets = PIECE_SHAPES[this.type].map((offset) => ({ ...offset }))

    // Поворачиваем формулу rotation раз (0 раз = без изменений)
    for (let i = 0; i < this.rotation; i++) {
      offsets = offsets.map(({ dx, dy }) => ({
        dx: dy,
        dy: -dx,
      }))
    }

    return offsets
  }

  /**
   * Абсолютные координаты всех 4 блоков на поле.
   * Берёт уже повёрнутые смещения из getOffsets() и прибавляет pivot.
   */
  getBlockPositions(): { x: number; y: number }[] {
    return this.getOffsets().map(({ dx, dy }) => ({
      x: this.x + dx,
      y: this.y + dy,
    }))
  }

  /**
   * Рисует фигуру: закрашивает все 4 клетки в чёрный.
   * Не меняет координаты pivot — только внешний вид клеток на доске.
   */
  draw(): void {
    for (const { x, y } of this.getBlockPositions()) {
      this.tetris.grid[y][x].setBlack(true)
    }
  }

  /**
   * Стирает фигуру: делает все 4 клетки белыми.
   * Вызывается ПЕРЕД сдвигом, чтобы на поле не оставались «хвосты»
   * от предыдущей позиции.
   */
  clear(): void {
    for (const { x, y } of this.getBlockPositions()) {
      this.tetris.grid[y][x].setBlack(false)
    }
  }

  /**
   * spawn — это просто первое появление фигуры на поле.
   * По сути то же самое, что draw(), но отдельное имя понятнее по смыслу:
   * «появилась» vs «перерисовалась после движения».
   */
  spawn(): void {
    this.draw()
  }

  /**
   * Проверяет, можно ли сдвинуть фигуру на одну клетку вниз.
   *
   * Ключевое правило: метод НИЧЕГО не меняет — ни pivot, ни клетки.
   * Он только отвечает на вопрос «да» или «нет».
   *
   * Почему так: если сначала сдвинуть, а потом обнаружить коллизию,
   * придётся откатывать изменения. Проще сначала проверить, потом двигать.
   *
   * Алгоритм:
   * 1. Запоминаем текущий this.y во временную переменную savedY.
   * 2. Временно делаем this.y + 1 — «притворяемся», что уже сдвинулись.
   * 3. Спрашиваем getBlockPositions() — где оказались бы блоки?
   * 4. Для КАЖДОГО блока проверяем три условия:
   *    - y >= sizeY  → блок ушёл ниже дна поля
   *    - x < 0 или x >= sizeX  → блок ушёл за боковую стенку
   *    - grid[y][x].isBlack  → клетка уже занята (будет актуально после lock)
   * 5. Возвращаем this.y обратно в savedY — откатываем «притворство».
   * 6. Если все блоки прошли проверку → true, иначе → false.
   */
  canMoveDown(): boolean {
    const savedY = this.y
    const currentPositions = this.getBlockPositions();
    this.y = savedY + 1

    const canMove = this.getBlockPositions().every(({ x, y }) => {
      const isOwnCell = currentPositions.some(({ x: oldX, y: oldY }) => oldX === x && oldY === y)
      
      if (y < 0 || y >= this.tetris.sizeY) return false
      if (x < 0 || x >= this.tetris.sizeX) return false
      if (this.tetris.grid[y][x].isBlack && !isOwnCell) return false
      return true
    })

    this.y = savedY
    return canMove
  }

  canMoveLeft(): boolean {
    const savedX = this.x
    const currentPositions = this.getBlockPositions();
    this.x = savedX - 1

    const canMove = this.getBlockPositions().every(({ x, y }) => {
      const isOwnCell = currentPositions.some(({ x: oldX, y: oldY }) => oldX === x && oldY === y)
      
      if (y < 0 || y >= this.tetris.sizeY) return false
      if (x < 0 || x >= this.tetris.sizeX) return false
      if (this.tetris.grid[y][x].isBlack && !isOwnCell) return false
      return true
    })

    this.x = savedX
    return canMove
  }

  canMoveRight(): boolean {
    const savedX = this.x
    const currentPositions = this.getBlockPositions();
    this.x = savedX + 1

    const canMove = this.getBlockPositions().every(({ x, y }) => {
      const isOwnCell = currentPositions.some(({ x: oldX, y: oldY }) => oldX === x && oldY === y)
      
      if (y < 0 || y >= this.tetris.sizeY) return false
      if (x < 0 || x >= this.tetris.sizeX) return false
      if (this.tetris.grid[y][x].isBlack && !isOwnCell) return false
      return true
    })

    this.x = savedX
    return canMove
  }

  /**
   * Один шаг падения вниз.
   *
   * Последовательность строго такая:
   *
   * 1. canMoveDown() — можно ли двигаться?
   *    └─ Нет → выходим (позже здесь будет lock — «прилипание» к полу)
   *    └─ Да  → идём дальше
   *
   * 2. clear() — стираем фигуру в СТАРОЙ позиции (пока this.y ещё не изменился)
   *
   * 3. this.y++ — сдвигаем pivot на одну клетку вниз
   *    (this.x не трогаем — падение только по вертикали)
   *
   * 4. draw() — рисуем фигуру в НОВОЙ позиции
   *    (getBlockPositions() теперь вернёт координаты с новым this.y)
   *
   * Почему именно clear → y++ → draw, а не наоборот:
   * - если сначала изменить y и нарисовать, старые клетки останутся чёрными;
   * - если сначала clear после изменения y, сотрём уже новые клетки.
   */
  moveDown(): boolean {
    if (!this.canMoveDown()) {
      // Фигура уперлась — пока просто останавливаемся.
      // На следующем этапе здесь будет lockPiece() и spawnPiece().
      return false
    } else {
      this.clear()
      this.y++
      this.draw()
      return true
    }
  }

  moveLeft(): boolean {
    if (!this.canMoveLeft()) {
      return false
    } else {
      this.clear()
      this.x--
      this.draw()
      return true
    }
  }

  moveRight(): boolean {
    if (!this.canMoveRight()) {
      return false
    } else {
      this.clear()
      this.x++
      this.draw()
      return true
    }
  }

  /**
   * Можно ли повернуть фигуру на 90° по часовой?
   * Тот же «притворный» приём, что в canMoveDown — меняем rotation,
   * проверяем, потом возвращаем rotation обратно.
   */
  canRotate(): boolean {
    const savedRotation = this.rotation
    const currentPositions = this.getBlockPositions()

    // % 4 — «остаток от деления на 4»:
    // 0→1, 1→2, 2→3, 3→0 (после 3 снова начальная форма)
    this.rotation = (this.rotation + 1) % 4

    const canRotate = this.getBlockPositions().every(({ x, y }) => {
      const isOwnCell = currentPositions.some(
        ({ x: oldX, y: oldY }) => oldX === x && oldY === y
      )

      if (y < 0 || y >= this.tetris.sizeY) return false
      if (x < 0 || x >= this.tetris.sizeX) return false
      if (this.tetris.grid[y][x].isBlack && !isOwnCell) return false
      return true
    })

    this.rotation = savedRotation
    return canRotate
  }

  /**
   * Поворот на 90° по часовой. Стрелка вверх в Tetris вызывает этот метод.
   */
  rotate(): boolean {
    if (!this.canRotate()) {
      return false
    }

    this.clear()
    this.rotation = (this.rotation + 1) % 4
    this.draw()
    return true
  }
}
