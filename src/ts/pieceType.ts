export enum PieceType {
  I = 'I',
  O = 'O',
  L = 'L',
  T = 'T',
}

export type Offset = { dx: number; dy: number }

/** Смещения блоков относительно pivot (pivot всегда в точке 0, 0) */
export const PIECE_SHAPES: Record<PieceType, Offset[]> = {
  [PieceType.I]: [
    { dx: -1, dy: 0 },
    { dx: 0, dy: 0 },
    { dx: 1, dy: 0 },
    { dx: 2, dy: 0 },
  ],
  [PieceType.O]: [
    { dx: 0, dy: 0 },
    { dx: 1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: 1, dy: 1 },
  ],
  [PieceType.L]: [
    { dx: 0, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: 0, dy: 2 },
    { dx: 1, dy: 2 },
  ],
  [PieceType.T]: [
    { dx: 0, dy: 0 },
    { dx: -1, dy: 1 },
    { dx: 0, dy: 1 },
    { dx: 1, dy: 1 },
  ],
}

export function randomPieceType(): PieceType {
  const types = Object.values(PieceType)
  return types[Math.floor(Math.random() * types.length)]
}
