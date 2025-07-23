import { Component, computed, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  imports: [CommonModule],
  templateUrl: './star-rating.html',
  styleUrl: './star-rating.less',
})
export class StarRating {
  readonly rating = input<number>(0);
  readonly readonly = input<boolean>(false);
  readonly ratingChange = output<number>();

  private readonly hoveredRating = signal<number | null>(null);

  readonly stars = computed(() => {
    const currentRating = this.hoveredRating() ?? this.rating();
    return Array.from({ length: 5 }, (_, index) => ({
      index: index + 1,
      filled: index < currentRating,
    }));
  });

  onStarClick(rating: number): void {
    if (this.readonly()) return;

    const newRating = this.rating() === rating ? 0 : rating;
    this.ratingChange.emit(newRating);
  }

  onStarHover(rating: number): void {
    if (this.readonly()) return;
    this.hoveredRating.set(rating);
  }

  onMouseLeave(): void {
    if (this.readonly()) return;
    this.hoveredRating.set(null);
  }
}
