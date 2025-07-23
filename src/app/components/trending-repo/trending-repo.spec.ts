import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Dialog } from '@angular/cdk/dialog';
import { By } from '@angular/platform-browser';

import { TrendingRepo } from './trending-repo';
import { RatingService } from '../../services/rating-service';
import { StarRating } from '../star-rating/star-rating';
import { TrendingRepoModal } from '../trending-repo-modal/trending-repo-modal';
import { GitHubRepository } from '../../types/github.types';

describe('TrendingRepo', () => {
  let component: TrendingRepo;
  let fixture: ComponentFixture<TrendingRepo>;
  let mockDialog: jasmine.SpyObj<Dialog>;
  let mockRatingService: jasmine.SpyObj<RatingService>;

  const mockRepository: GitHubRepository = {
    id: 123,
    name: 'test-repo',
    full_name: 'testuser/test-repo',
    description: 'A test repository for unit testing',
    html_url: 'https://github.com/testuser/test-repo',
    stargazers_count: 150,
    open_issues_count: 5,
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-20T14:20:00Z',
    owner: {
      login: 'testuser',
      avatar_url: 'https://avatars.githubusercontent.com/u/123?v=4',
      html_url: 'https://github.com/testuser',
    },
  };

  beforeEach(async () => {
    mockDialog = jasmine.createSpyObj('Dialog', ['open']);
    mockRatingService = jasmine.createSpyObj('RatingService', ['getRating']);

    await TestBed.configureTestingModule({
      imports: [TrendingRepo, StarRating],
      providers: [
        { provide: Dialog, useValue: mockDialog },
        { provide: RatingService, useValue: mockRatingService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TrendingRepo);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      fixture.componentRef.setInput('repository', mockRepository);
      expect(component).toBeTruthy();
    });

    it('should require repository input', () => {
      expect(() => fixture.detectChanges()).toThrow();
    });

    it('should initialize with repository input', () => {
      fixture.componentRef.setInput('repository', mockRepository);
      fixture.detectChanges();

      expect(component.repository()).toEqual(mockRepository);
    });
  });

  describe('Template Rendering', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('repository', mockRepository);
      mockRatingService.getRating.and.returnValue(0);
      fixture.detectChanges();
    });

    it('should display repository name as a link', () => {
      const titleLink = fixture.debugElement.query(By.css('.repo-title a'));

      expect(titleLink.nativeElement.textContent.trim()).toBe('test-repo');
      expect(titleLink.nativeElement.href).toBe(
        'https://github.com/testuser/test-repo',
      );
      expect(titleLink.nativeElement.target).toBe('_blank');
    });

    it('should display repository description', () => {
      const description = fixture.debugElement.query(
        By.css('.repo-description'),
      );

      expect(description.nativeElement.textContent.trim()).toBe(
        'A test repository for unit testing',
      );
    });

    it('should display "No description available" when description is null', () => {
      const repoWithoutDescription = { ...mockRepository, description: null };
      fixture.componentRef.setInput('repository', repoWithoutDescription);
      fixture.detectChanges();

      const description = fixture.debugElement.query(
        By.css('.repo-description'),
      );
      expect(description.nativeElement.textContent.trim()).toBe(
        'No description available',
      );
    });

    it('should display owner avatar with correct attributes', () => {
      const avatar = fixture.debugElement.query(By.css('.owner-avatar'));

      expect(avatar.nativeElement.src).toBe(
        'https://avatars.githubusercontent.com/u/123?v=4',
      );
      expect(avatar.nativeElement.alt).toBe('testuser avatar');
    });

    it('should display stars count', () => {
      const starsElement = fixture.debugElement.query(
        By.css('.meta-item.stars'),
      );

      expect(starsElement.nativeElement.textContent.trim()).toContain(
        'Stars: 150',
      );
    });

    it('should display issues count', () => {
      const issuesElement = fixture.debugElement.query(
        By.css('.meta-item.issues'),
      );

      expect(issuesElement.nativeElement.textContent.trim()).toContain(
        'Issues: 5',
      );
    });

    it('should display zero issues when open_issues_count is null', () => {
      const repoWithNullIssues = {
        ...mockRepository,
        open_issues_count: null as any,
      };
      fixture.componentRef.setInput('repository', repoWithNullIssues);
      fixture.detectChanges();

      const issuesElement = fixture.debugElement.query(
        By.css('.meta-item.issues'),
      );
      expect(issuesElement.nativeElement.textContent.trim()).toContain(
        'Issues: 0',
      );
    });

    it('should display owner information with link', () => {
      const ownerLink = fixture.debugElement.query(By.css('.owner-link'));

      expect(ownerLink.nativeElement.textContent.trim()).toBe('testuser');
      expect(ownerLink.nativeElement.href).toBe('https://github.com/testuser');
      expect(ownerLink.nativeElement.target).toBe('_blank');
    });
  });

  describe('Rating Display', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('repository', mockRepository);
    });

    it('should display star rating when rating is greater than 0', () => {
      mockRatingService.getRating.and.returnValue(4);
      fixture.detectChanges();

      const ratingDisplay = fixture.debugElement.query(
        By.css('.rating-display'),
      );
      const starRating = fixture.debugElement.query(By.directive(StarRating));

      expect(ratingDisplay).toBeTruthy();
      expect(starRating).toBeTruthy();
    });

    it('should not display star rating when rating is 0', () => {
      mockRatingService.getRating.and.returnValue(0);
      fixture.detectChanges();

      const ratingDisplay = fixture.debugElement.query(
        By.css('.rating-display'),
      );

      expect(ratingDisplay).toBeFalsy();
    });

    it('should pass correct rating to star rating component', () => {
      mockRatingService.getRating.and.returnValue(3);
      fixture.detectChanges();

      const starRatingComponent = fixture.debugElement.query(
        By.directive(StarRating),
      );
      const starRatingInstance = starRatingComponent.componentInstance;

      expect(starRatingInstance.rating()).toBe(3);
      expect(starRatingInstance.readonly()).toBe(true);
    });
  });

  describe('getDaysAgo Method', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('repository', mockRepository);
      fixture.detectChanges();
    });

    it('should calculate days ago correctly', () => {
      const testDate = new Date();
      testDate.setDate(testDate.getDate() - 5);
      const dateString = testDate.toISOString();

      const result = component.getDaysAgo(dateString);

      expect(result).toBe(5);
    });

    it('should handle same day correctly', () => {
      const today = new Date().toISOString();

      const result = component.getDaysAgo(today);

      expect(result).toBeLessThanOrEqual(1);
    });

    it('should handle future dates correctly', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);
      const dateString = futureDate.toISOString();

      const result = component.getDaysAgo(dateString);

      expect(result).toBe(3);
    });

    it('should round up partial days', () => {
      const testDate = new Date();
      testDate.setHours(testDate.getHours() - 25);
      const dateString = testDate.toISOString();

      const result = component.getDaysAgo(dateString);

      expect(result).toBe(2);
    });
  });

  describe('getCurrentRating Method', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('repository', mockRepository);
      fixture.detectChanges();
    });

    it('should return rating from rating service', () => {
      mockRatingService.getRating.and.returnValue(4);

      const result = component.getCurrentRating();

      expect(mockRatingService.getRating).toHaveBeenCalledWith(123);
      expect(result).toBe(4);
    });

    it('should return 0 when no rating exists', () => {
      mockRatingService.getRating.and.returnValue(0);

      const result = component.getCurrentRating();

      expect(result).toBe(0);
    });
  });

  describe('Modal Opening', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('repository', mockRepository);
      mockRatingService.getRating.and.returnValue(0);
      fixture.detectChanges();
    });

    it('should open modal when repository card is clicked', () => {
      const repositoryCard = fixture.debugElement.query(
        By.css('.repository-card'),
      );

      repositoryCard.nativeElement.click();

      expect(mockDialog.open).toHaveBeenCalledWith(TrendingRepoModal, {
        data: { repository: mockRepository },
        panelClass: 'repo-modal-panel',
      });
    });

    it('should call openModal method when card is clicked', () => {
      spyOn(component, 'openModal');
      const repositoryCard = fixture.debugElement.query(
        By.css('.repository-card'),
      );

      repositoryCard.nativeElement.click();

      expect(component.openModal).toHaveBeenCalled();
    });

    it('should pass current repository data to modal', () => {
      component.openModal();

      expect(mockDialog.open).toHaveBeenCalledWith(
        TrendingRepoModal,
        jasmine.objectContaining({
          data: { repository: mockRepository },
        }),
      );
    });
  });

  describe('Component Integration', () => {
    it('should update display when repository input changes', () => {
      fixture.componentRef.setInput('repository', mockRepository);
      mockRatingService.getRating.and.returnValue(0);
      fixture.detectChanges();

      let titleElement = fixture.debugElement.query(By.css('.repo-title a'));
      expect(titleElement.nativeElement.textContent.trim()).toBe('test-repo');

      const newRepository: GitHubRepository = {
        ...mockRepository,
        id: 456,
        name: 'updated-repo',
        description: 'Updated description',
      };

      fixture.componentRef.setInput('repository', newRepository);
      fixture.detectChanges();

      titleElement = fixture.debugElement.query(By.css('.repo-title a'));
      expect(titleElement.nativeElement.textContent.trim()).toBe(
        'updated-repo',
      );
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('repository', mockRepository);
      mockRatingService.getRating.and.returnValue(3);
      fixture.detectChanges();
    });

    it('should have proper alt text for owner avatar', () => {
      const avatar = fixture.debugElement.query(By.css('.owner-avatar'));

      expect(avatar.nativeElement.alt).toBe('testuser avatar');
    });

    it('should have external links with target="_blank"', () => {
      const externalLinks = fixture.debugElement.queryAll(
        By.css('a[target="_blank"]'),
      );

      expect(externalLinks.length).toBeGreaterThan(0);
      externalLinks.forEach((link) => {
        expect(link.nativeElement.target).toBe('_blank');
      });
    });

    it('should have clickable card for keyboard navigation', () => {
      const repositoryCard = fixture.debugElement.query(
        By.css('.repository-card'),
      );

      expect(repositoryCard.nativeElement).toBeTruthy();
      expect(
        repositoryCard.listeners.find((l) => l.name === 'click'),
      ).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing repository data gracefully', () => {
      const incompleteRepo = {
        ...mockRepository,
        owner: {
          login: '',
          avatar_url: '',
          html_url: '',
        },
      };

      fixture.componentRef.setInput('repository', incompleteRepo);
      mockRatingService.getRating.and.returnValue(0);

      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle invalid date strings in getDaysAgo', () => {
      fixture.componentRef.setInput('repository', mockRepository);
      fixture.detectChanges();

      const result = component.getDaysAgo('invalid-date');

      expect(isNaN(result)).toBe(true);
    });
  });
});
