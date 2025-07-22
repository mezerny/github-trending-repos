import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {GitHubRepository} from '../../types/github.types';

@Component({
  selector: 'app-trending-repo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './trending-repo.html',
  styleUrl: './trending-repo.less'
})
export class TrendingRepo {
  // Input signal for the repository data
  readonly repository = input.required<GitHubRepository>();

  getDaysAgo(dateString: string): number {
    const createdDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
