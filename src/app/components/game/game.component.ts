import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GridComponent } from '../grid/grid.component';
import { GameService } from '../../services/game.service';
import { map, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { GameOverDialogComponent } from '../game-over-dialog/game-over-dialog.component';
import { Score } from '../../interfaces';
import { INITIAL_CELL_SIZE } from '../../constants/game.constants';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    GameOverDialogComponent,
    GridComponent,
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit, OnDestroy {
  protected userScore$: Observable<number> | undefined;
  protected computerScore$: Observable<number> | undefined;
  protected gameSettings: FormGroup;
  protected gameStarted = false;

  private isDialogOpen = false;
  private destroy$ = new Subject<void>();

  constructor(
    private gameService: GameService,
    private fb: FormBuilder,
    private dialog: MatDialog,
  ) {
    this.gameSettings = this.fb.group({
      time: [1000, Validators.required],
      cellSize: [INITIAL_CELL_SIZE, Validators.required],
    });
  }

  protected get timeControl(): FormControl {
    return this.gameSettings.get('time') as FormControl;
  }

  protected get cellSizeControl(): FormControl {
    return this.gameSettings.get('cellSize') as FormControl;
  }

  public ngOnInit(): void {
    this.initSubscription();

    this.cellSizeControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(size => {
        this.gameService.updateCellSize(size);
      });
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected startGame(): void {
    if (!this.gameStarted && this.timeControl.valid) {
      this.gameStarted = true;
      this.gameService.startGame(this.timeControl.value);
      this.gameService.score$.value$
        .pipe(takeUntil(this.destroy$))
        .subscribe(scores => {
          if ((scores.user >= 10 || scores.computer >= 10) && !this.isDialogOpen) {
            this.gameService.stopGame();
            this.isDialogOpen = true;
            this.gameStarted = false;
            this.showResult(scores);
          }
        });
    }
  }

  private showResult(scores: Score): void {
    this.dialog.open(GameOverDialogComponent, {
      data: {
        userScore: scores.user,
        resultMessage: scores.user >= 10 ? 'Player Wins!' : 'Computer Wins!'
      }
    }).afterClosed().subscribe(() => {
      this.isDialogOpen = false;
      this.resetGame();
    });
  }

  private resetGame(): void {
    this.gameService.resetGame();
    this.gameStarted = false;
  }

  private initSubscription(): void {
    this.userScore$ = this.gameService.score$.value$
      .pipe(map(score => score.user));

    this.computerScore$ = this.gameService.score$.value$
      .pipe(map(score => score.computer));
  }
}
