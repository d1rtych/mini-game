import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { GameOverDialogData } from '../../interfaces';

@Component({
  selector: 'app-game-over-dialog',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogContent,
    MatDialogTitle,
  ],
  templateUrl: './game-over-dialog.component.html',
  styleUrl: './game-over-dialog.component.scss'
})
export class GameOverDialogComponent {
  readonly data = inject<GameOverDialogData>(MAT_DIALOG_DATA);
}
