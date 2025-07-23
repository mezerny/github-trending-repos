import { TestBed } from '@angular/core/testing';
import { RatingService } from './rating-service';

describe('RatingService', () => {
  let service: RatingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RatingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getRating', () => {
    it('should return 0 for non-existent rating', () => {
      const rating = service.getRating(123);
      expect(rating).toBe(0);
    });

    it('should return the correct rating for existing repo', () => {
      service.setRating(123, 4);
      const rating = service.getRating(123);
      expect(rating).toBe(4);
    });
  });

  describe('setRating', () => {
    it('should set a valid rating', () => {
      service.setRating(123, 5);
      expect(service.getRating(123)).toBe(5);
    });

    it('should update an existing rating', () => {
      service.setRating(123, 3);
      service.setRating(123, 5);
      expect(service.getRating(123)).toBe(5);
    });

    it('should remove rating when set to 0', () => {
      service.setRating(123, 4);
      service.setRating(123, 0);
      expect(service.getRating(123)).toBe(0);
    });

    it('should throw error for rating below 0', () => {
      expect(() => service.setRating(123, -1)).toThrowError('Rating must be between 0 and 5');
    });

    it('should throw error for rating above 5', () => {
      expect(() => service.setRating(123, 6)).toThrowError('Rating must be between 0 and 5');
    });

    it('should allow boundary values 0 and 5', () => {
      expect(() => service.setRating(123, 0)).not.toThrow();
      expect(() => service.setRating(123, 5)).not.toThrow();
    });

    it('should maintain separate ratings for different repos', () => {
      service.setRating(123, 3);
      service.setRating(456, 5);

      expect(service.getRating(123)).toBe(3);
      expect(service.getRating(456)).toBe(5);
    });
  });
});
