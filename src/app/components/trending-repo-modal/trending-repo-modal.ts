import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { GitHubRepository } from '../../types/github.types';
import { StarRating } from '../star-rating/star-rating';
import { RatingService } from '../../services/rating-service';

@Component({
  selector: 'app-trending-repo-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, StarRating],
  templateUrl: './trending-repo-modal.html',
  styleUrl: './trending-repo-modal.less',
})
export class TrendingRepoModal {
  readonly data = inject<{ repository: GitHubRepository }>(DIALOG_DATA);
  private readonly dialogRef = inject(DialogRef);
  private readonly ratingService = inject(RatingService);

  close(): void {
    this.dialogRef.close();
  }

  getCurrentRating(): number {
    return this.ratingService.getRating(this.data.repository.id);
  }

  onRatingChange(rating: number): void {
    this.ratingService.setRating(this.data.repository.id, rating);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}
