import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent implements OnInit, OnDestroy {
  protected cells: string[][] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private gameService: GameService,
  ) {}

  public ngOnInit(): void {
    this.initGrid();
    this.initSubscription();
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected onCellClick(row: number, col: number): void {
    this.gameService.checkCell(row, col);
  }

  private initGrid(): void {
    this.cells = Array(10).fill(null).map(() => Array(10).fill('blue'));
  }

  private initSubscription(): void {
    this.gameService.cell$.value$
      .pipe(takeUntil(this.destroy$))
      .subscribe(cell => {
      if (cell.position[0] === -1 && cell.position[1] === -1 && cell.color === 'reset') {
        this.initGrid();
      } else {
        const [row, col] = cell.position;
        this.cells[row][col] = cell.color;
      }
    });
    this.gameService.cellSize$.value$
      .pipe(takeUntil(this.destroy$))
      .subscribe(size => {
        document.documentElement.style.setProperty('--cell-size', `${size}px`);
      });
  }
}
