import { Injectable } from '@angular/core';
import { Subject, Subscription, timer } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { SubjectItem } from '../utils/subject-item';
import { BehaviorSubjectItem } from '../utils/behavior-subject-item';
import { INITIAL_CELL_SIZE, INITIAL_SCORE } from '../constants/game.constants';
import { Player } from '../enums/game.enums';
import { Cell, Score } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  public cell$ = new SubjectItem<Cell>();
  public score$ = new BehaviorSubjectItem<Score>(INITIAL_SCORE);
  public cellSize$ = new BehaviorSubjectItem<number>(INITIAL_CELL_SIZE);

  private interval$: Subscription | undefined;
  private currentCell: [number, number] = [-1, -1];
  private previousCells: Set<string> = new Set();
  private timeLeftSubject = new BehaviorSubjectItem<number>(0);

  private stopTimer$ = new Subject<void>();

  public startGame(N: number): void {
    this.resetGame();
    this.interval$ = timer(0, N).pipe(
      tap(() => this.highlightRandomCell(N))
    ).subscribe();
  }

  public stopGame(): void {
    if (this.interval$) {
      this.interval$.unsubscribe();
    }
    this.stopTimer$.next();
    this.stopTimer$.complete();
    this.stopTimer$ = new Subject<void>();
  }

  public resetGame() {
    this.stopGame();
    this.currentCell = [-1, -1];
    this.previousCells.clear();
    this.score$.value = { user: 0, computer: 0 };
    this.cell$.subject.next({ position: [-1, -1], color: 'reset' });
  }

  public checkCell(row: number, col: number) {
    if (this.currentCell[0] === row && this.currentCell[1] === col) {
      this.cell$.next({ position: [row, col], color: 'green' });
      this.updateScore(Player.User);
      this.currentCell = [-1, -1];
    }
  }

  public updateCellSize(size: number) {
    this.cellSize$.value = size;
  }

  private highlightRandomCell(displayTime: number): void {
    if (this.currentCell[0] !== -1 && this.currentCell[1] !== -1) {
      // Mark the previous cell as missed
      this.cell$.next({ position: [this.currentCell[0], this.currentCell[1]], color: 'red' });
      this.updateScore(Player.Computer);
    }

    let row, col;
    do {
      row = Math.floor(Math.random() * 10);
      col = Math.floor(Math.random() * 10);
    } while (this.previousCells.has(`${row}-${col}`));

    this.previousCells.add(`${row}-${col}`);
    this.currentCell = [row, col];
    this.cell$.next({ position: [row, col], color: 'yellow' });

    this.timeLeftSubject.value = displayTime;

    timer(displayTime).pipe(
      takeUntil(this.stopTimer$)
    ).subscribe(() => {
      if (this.currentCell[0] === row && this.currentCell[1] === col) {
        this.cell$.next({ position: [row, col], color: 'red' });
        this.updateScore(Player.Computer);
        this.currentCell = [-1, -1];
      }
    });
  }

  private updateScore(player: Player) {
    const currentScores = this.score$.value;
    if (player === Player.User) {
      this.score$.value = { ...currentScores, user: currentScores.user + 1 };
    } else {
      this.score$.value = { ...currentScores, computer: currentScores.computer + 1 };
    }
  }
}
