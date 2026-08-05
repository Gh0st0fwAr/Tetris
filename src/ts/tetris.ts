import { Cell } from './cell'
import { Pivot } from './pivot'
import { randomPieceType, PIECE_SHAPES, PieceType } from './pieceType'
// type Cell = {
//   x: number,
//   y: number
// }

type Grid = Cell[][]
export enum Size {
  Small = 'small',
  Medium = 'medium',
  Large = 'large'
}

// type CellObject = {
//   [x: number]: {
//     [y: number]: Cell
//   }
// }
export class Tetris {
  sizeX: number;
  sizeY: number;
  cellSize: number;
  grid: Cell[][] = [];
  board: HTMLElement;
  parentComponent: HTMLElement;
  activePiece: Pivot | null = null;
  intervalId: number | null = null;

  constructor(size: Size, parentComponent: HTMLElement) {
    let sizeX = 0;
    let sizeY = 0;
    let cellSize = 0;
    switch(size) {
      case Size.Small:
        sizeX = 7;
        sizeY = 11;
        cellSize = 54;
        break;
      case Size.Medium:
        sizeX = 10;
        sizeY = 16;
        cellSize = 36;
        break;
      case Size.Large:
        sizeX = 16;
        sizeY = 24;
        cellSize = 18;
        break;
    }
    this.sizeX = sizeX
    this.sizeY = sizeY
    this.cellSize = cellSize;
    this.parentComponent = parentComponent;
    this.board = document.createElement('div');
    this.grid = [];
    this.initControls();
    this.createBoard();
    this.startFalling();
    // this.spawnPiece();
    // document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  initControls(): void {
    document.addEventListener('keydown', this.handleKeyDown.bind(this))
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      this.activePiece?.moveLeft();
    }
    if (event.key === 'ArrowRight') {
      this.activePiece?.moveRight();
    }
    if (event.key === 'ArrowDown') {
      this.activePiece?.moveDown();
    }
    if (event.key === ' ') {
      this.activePiece?.rotate();
    }
  }

  canSpawn(type: PieceType): boolean {
    const spawnX = Math.floor(this.sizeX / 2)
    const spawnY = 0;

    const offsets = PIECE_SHAPES[type];
    return offsets.every(({dx, dy}) => {
      const x = spawnX + dx;
      const y = spawnY + dy;
    
      if (y < 0 || y >= this.sizeY) return false
      if (x < 0 || x >= this.sizeX) return false
      if (this.grid[y][x].isBlack) return false
      return true
    })

    
  }


  startFalling(): void { 
    this.intervalId = setInterval(() => {
      // console.log(this.activePiece?.moveDown())
      if (this.activePiece?.moveDown() === false) {
        this.lockPiece()
        this.spawnPiece()
        // console.log(this.activePiece)
      }
      
      // this.checkLines();
      // this.activePiece?.moveDown();
      // if (this.activePiece?.moveDown() === true) {
      //   this.activePiece?.moveDown()
      // } else {
      //   // this.
      // }
    }, 1000)
    // console.log(this.intervalId);
    // console.log(setInterval(() => {}, 1000));
  };

  isRowFull(y: number): boolean {
    for (let x = 0; x < this.sizeX; x++) {
      if (!this.grid[y][x].isBlack) {
        return false   // нашли белую — ряд НЕ полный
      }
    }
    return true        // все x прошли — ряд полный
  }

   clearRow(y: number): void {
    for (let x = 0; x < this.sizeX; x++) {
      this.grid[y][x].setBlack(false);
    }
  }

  clearFullRows(): void {
    for (let y = this.sizeY - 1; y >= 0; y--) {
      if (this.isRowFull(y)) {
        this.clearRow(y);
        this.setRowsDown(y);
        y--;
      }
    }
   }

  setRowsDown(fromY: number) {
    for (let y = fromY; y >= 1; y--) {
      for (let x = 0; x < this.sizeX; x++) {
        const isBlack = this.grid[y - 1][x].isBlack;
        this.grid[y][x].setBlack(isBlack);
      }
    }
    for (let x = 0; x < this.sizeX; x++) {
      this.grid[0][x].setBlack(false);
    }
  }

  lockPiece(): void {
    this.activePiece = null;
    for (let y = 0; y < this.sizeY; y++) {
      if (this.isRowFull(y)) {
        this.clearRow(y);
        this.clearFullRows();
        this.setRowsDown(y);
      }
    }
  }
  
  gameOver(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;    
    }
      this.activePiece = null;
    
  }
  createBoard(): void {
    this.board.classList.add('board');
    this.board.style.gridTemplateColumns = `repeat(${this.sizeX}, ${this.cellSize}px)`;
    this.board.style.gridTemplateRows = `repeat(${this.sizeY}, ${this.cellSize}px)`;
    this.parentComponent.appendChild(this.board);
    this.createCells();
    this.spawnPiece();
  }

  createCells(): void {
    for (let y = 0; y < this.sizeY; y++) {
      this.grid[y] = [];
      for (let x = 0; x < this.sizeX; x++) {
        this.grid[y][x] = new Cell(x, y, this.board, this)
      } 
    }
    // this.grid[0][5].sayHello();
   }
  spawnPiece(): void {
    const x = Math.floor(this.sizeX / 2)
    const type = randomPieceType()
    
    if (!this.canSpawn(type)) {
      this.gameOver()
      return  // ← важно! дальше не идём
    }

    this.activePiece = new Pivot(x, 0, type, this)
    this.activePiece.spawn();
  }
  // sayHello(): void {
  //   console.log('Hello')
  // }
}
