import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { TrendingRepoModal } from './trending-repo-modal';
import { RatingService } from '../../services/rating-service';
import { GitHubRepository } from '../../types/github.types';
import { StarRating } from '../star-rating/star-rating';

describe('TrendingRepoModal', () => {
  let component: TrendingRepoModal;
  let fixture: ComponentFixture<TrendingRepoModal>;
  let mockDialogRef: jasmine.SpyObj<DialogRef>;
  let mockRatingService: jasmine.SpyObj<RatingService>;

  const mockRepository: GitHubRepository = {
    id: 123,
    name: 'test-repo',
    full_name: 'user/test-repo',
    owner: {
      login: 'testuser',
      avatar_url: 'https://example.com/avatar.jpg',
      html_url: 'https://example.com/html'
    },
    description: 'A test repository',
    html_url: 'https://github.com/user/test-repo',
    stargazers_count: 100,
    open_issues_count: 27,
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2025-01-15T10:30:00Z',
  };

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('DialogRef', ['close']);
    mockRatingService = jasmine.createSpyObj('RatingService', ['getRating', 'setRating']);

    await TestBed.configureTestingModule({
      imports: [TrendingRepoModal, StarRating],
      providers: [
        { provide: DIALOG_DATA, useValue: { repository: mockRepository } },
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: RatingService, useValue: mockRatingService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TrendingRepoModal);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with repository data', () => {
    expect(component.data.repository).toEqual(mockRepository);
  });

  describe('close', () => {
    it('should close the dialog', () => {
      component.close();
      expect(mockDialogRef.close).toHaveBeenCalled();
    });
  });

  describe('getCurrentRating', () => {
    it('should return rating from service', () => {
      mockRatingService.getRating.and.returnValue(4);

      const rating = component.getCurrentRating();

      expect(mockRatingService.getRating).toHaveBeenCalledWith(123);
      expect(rating).toBe(4);
    });

    it('should return 0 for unrated repository', () => {
      mockRatingService.getRating.and.returnValue(0);

      const rating = component.getCurrentRating();

      expect(rating).toBe(0);
    });
  });

  describe('onRatingChange', () => {
    it('should update rating through service', () => {
      component.onRatingChange(5);

      expect(mockRatingService.setRating).toHaveBeenCalledWith(123, 5);
    });

    it('should handle rating removal', () => {
      component.onRatingChange(0);

      expect(mockRatingService.setRating).toHaveBeenCalledWith(123, 0);
    });
  });

  describe('formatDate', () => {
    it('should format date string correctly', () => {
      const formattedDate = component.formatDate('2024-01-15T10:30:00Z');

      expect(formattedDate).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    it('should handle different date formats', () => {
      const formattedDate = component.formatDate('2024-12-01T00:00:00Z');

      expect(formattedDate).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });
  });

  describe('integration with StarRating component', () => {
    beforeEach(() => {
      mockRatingService.getRating.and.returnValue(3);
      fixture.detectChanges();
    });

    it('should display current rating in star component', () => {
      const starRatingElement = fixture.debugElement.query(sel => sel.componentInstance instanceof StarRating);
      expect(starRatingElement).toBeTruthy();
    });

    it('should handle rating changes from star component', () => {
      spyOn(component, 'onRatingChange');

      const starRatingComponent = fixture.debugElement.query(sel => sel.componentInstance instanceof StarRating).componentInstance;
      starRatingComponent.ratingChange.emit(4);

      expect(component.onRatingChange).toHaveBeenCalledWith(4);
    });
  });

  describe('dialog data requirements', () => {
    it('should have repository data available', () => {
      expect(component.data).toBeDefined();
      expect(component.data.repository).toBeDefined();
      expect(component.data.repository.id).toBe(123);
    });
  });

  describe('service interactions', () => {
    it('should get rating on component initialization', () => {
      mockRatingService.getRating.and.returnValue(2);

      const rating = component.getCurrentRating();

      expect(mockRatingService.getRating).toHaveBeenCalledWith(mockRepository.id);
      expect(rating).toBe(2);
    });

    it('should set rating when changed', () => {
      component.onRatingChange(5);

      expect(mockRatingService.setRating).toHaveBeenCalledWith(mockRepository.id, 5);
    });
  });
});
