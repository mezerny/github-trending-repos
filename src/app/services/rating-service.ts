import { Injectable, signal } from '@angular/core';

export interface RepoRating {
  repoId: number;
  rating: number;
}

@Injectable({
  providedIn: 'root',
})
export class RatingService {
  private readonly ratingsMap = signal<Map<number, number>>(new Map());

  getRating(repoId: number): number {
    return this.ratingsMap().get(repoId) ?? 0;
  }

  setRating(repoId: number, rating: number): void {
    if (rating < 0 || rating > 5) {
      throw new Error('Rating must be between 0 and 5');
    }

    this.ratingsMap.update((map) => {
      const newMap = new Map(map);
      if (rating === 0) {
        newMap.delete(repoId);
      } else {
        newMap.set(repoId, rating);
      }
      return newMap;
    });
  }
}
