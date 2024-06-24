import { CellColor } from '../types/cell-color.types';

export interface Score {
  user: number;
  computer: number
}

export interface Cell {
  position: [number, number];
  color: CellColor;
}
