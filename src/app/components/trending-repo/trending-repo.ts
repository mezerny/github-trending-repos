import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dialog } from '@angular/cdk/dialog';
import { GitHubRepository } from '../../types/github.types';
import { RatingService } from '../../services/rating-service';
import { StarRating } from '../star-rating/star-rating';
import { TrendingRepoModal } from '../trending-repo-modal/trending-repo-modal';

@Component({
  selector: 'app-trending-repo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, StarRating],
  templateUrl: './trending-repo.html',
  styleUrl: './trending-repo.less',
})
export class TrendingRepo {
  readonly repository = input.required<GitHubRepository>();
  private readonly dialog = inject(Dialog);
  private readonly ratingService = inject(RatingService);

  getDaysAgo(dateString: string): number {
    const createdDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getCurrentRating(): number {
    return this.ratingService.getRating(this.repository().id);
  }

  openModal(): void {
    this.dialog.open(TrendingRepoModal, {
      data: { repository: this.repository() },
      panelClass: 'repo-modal-panel',
    });
  }
}
