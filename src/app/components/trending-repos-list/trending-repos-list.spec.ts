import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ElementRef } from '@angular/core';
import { of, throwError } from 'rxjs';
import { TrendingReposList } from './trending-repos-list';
import { GitHubRepoService } from '../../services/github-repo-service';
import { GitHubRepository, PaginatedResult } from '../../types/github.types';
import { TrendingRepo } from '../trending-repo/trending-repo';

describe('TrendingReposList', () => {
  let component: TrendingReposList;
  let fixture: ComponentFixture<TrendingReposList>;
  let mockGitHubService: jasmine.SpyObj<GitHubRepoService>;

  const mockRepository: GitHubRepository = {
    id: 123,
    name: 'test-repo',
    full_name: 'user/test-repo',
    owner: {
      login: 'testuser',
      avatar_url: 'https://example.com/avatar.jpg',
      html_url: 'https://example.com/avatar.jpg',
    },
    description: 'A test repository',
    html_url: 'https://github.com/user/test-repo',
    stargazers_count: 100,
    open_issues_count: 20,
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2025-01-15T10:30:00Z',
  };

  const mockPaginatedResult: PaginatedResult<GitHubRepository> = {
    data: [mockRepository],
    totalCount: 150,
    currentPage: 1,
    totalPages: 5,
    hasNext: true,
    hasPrevious: false,
  };

  beforeEach(async () => {
    mockGitHubService = jasmine.createSpyObj('GitHubRepoService', [
      'searchRepositories',
    ]);

    await TestBed.configureTestingModule({
      imports: [TrendingReposList, TrendingRepo],
      providers: [{ provide: GitHubRepoService, useValue: mockGitHubService }],
    }).compileComponents();

    fixture = TestBed.createComponent(TrendingReposList);
    component = fixture.componentInstance;

    component.reposList.set([]);
    component.initialLoading.set(false);
    component.loadingMore.set(false);
    component.error.set(null);
    component.currentPage.set(1);
    component.totalCount.set(0);
    component.hasReachedEnd.set(false);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should initialize with default signal values', () => {
      expect(component.reposList()).toEqual([]);
      expect(component.initialLoading()).toBe(false);
      expect(component.loadingMore()).toBe(false);
      expect(component.error()).toBe(null);
      expect(component.currentPage()).toBe(1);
      expect(component.totalCount()).toBe(0);
      expect(component.hasReachedEnd()).toBe(false);
    });

    it('should compute isLoading correctly', () => {
      expect(component.isLoading()).toBe(false);

      component.initialLoading.set(true);
      expect(component.isLoading()).toBe(true);

      component.initialLoading.set(false);
      component.loadingMore.set(true);
      expect(component.isLoading()).toBe(true);
    });

    it('should compute searchParams correctly', () => {
      const params = component.searchParams();
      expect(params.page).toBe(1);
      expect(params.perPage).toBe(30);

      component.currentPage.set(3);
      const updatedParams = component.searchParams();
      expect(updatedParams.page).toBe(3);
    });
  });

  describe('ngOnInit', () => {
    it('should load initial repositories on init', fakeAsync(() => {
      mockGitHubService.searchRepositories.and.returnValue(
        of(mockPaginatedResult),
      );

      component.ngOnInit();
      tick();

      expect(mockGitHubService.searchRepositories).toHaveBeenCalledWith({
        page: 1,
        perPage: 30,
      });
      expect(component.reposList()).toEqual([mockRepository]);
      expect(component.totalCount()).toBe(150);
      expect(component.hasReachedEnd()).toBe(false);
    }));
  });

  describe('loadInitialRepositories', () => {
    it('should set loading state and fetch repositories', fakeAsync(() => {
      mockGitHubService.searchRepositories.and.returnValue(
        of(mockPaginatedResult),
      );

      expect(component.initialLoading()).toBe(false);

      component.ngOnInit();

      expect(component.error()).toBe(null);

      tick();

      expect(component.initialLoading()).toBe(false);
      expect(component.reposList()).toEqual([mockRepository]);
      expect(component.totalCount()).toBe(150);
      expect(component.hasReachedEnd()).toBe(false);
      expect(component.error()).toBe(null);
    }));

    it('should set hasReachedEnd when no more pages', fakeAsync(() => {
      const lastPageResult = {
        ...mockPaginatedResult,
        hasNext: false,
      };
      mockGitHubService.searchRepositories.and.returnValue(of(lastPageResult));

      component.ngOnInit();
      tick();

      expect(component.hasReachedEnd()).toBe(true);
    }));
  });

  describe('loadMoreRepositories', () => {
    beforeEach(() => {
      component.reposList.set([mockRepository]);
      component.currentPage.set(1);
      component.hasReachedEnd.set(false);
      component.error.set(null);
      component.initialLoading.set(false);
      component.loadingMore.set(false);
    });

    it('should load and append more repositories', fakeAsync(() => {
      const moreRepo = { ...mockRepository, id: 456, name: 'another-repo' };
      const moreResult = {
        ...mockPaginatedResult,
        data: [moreRepo],
        currentPage: 2,
        hasNext: false,
      };
      mockGitHubService.searchRepositories.and.returnValue(of(moreResult));

      component['loadMoreRepositories']();

      tick();

      expect(component.loadingMore()).toBe(false);
      expect(component.currentPage()).toBe(2);
      expect(component.reposList()).toEqual([mockRepository, moreRepo]);
      expect(component.hasReachedEnd()).toBe(true);
    }));

    it('should handle error during load more', fakeAsync(() => {
      const initialReposList = [mockRepository];
      component.reposList.set([...initialReposList]);

      mockGitHubService.searchRepositories.and.returnValue(
        throwError(() => new Error('API Error')),
      );

      spyOn(console, 'error');

      component['loadMoreRepositories']();

      tick();

      expect(component.loadingMore()).toBe(false);
      expect(component.error()).toBe(
        'Failed to load more repositories. Please try again.',
      );
      expect(component.currentPage()).toBe(1);
      expect(component.reposList()).toEqual(initialReposList);
      expect(console.error).toHaveBeenCalledWith(
        'Error loading more repositories:',
        jasmine.any(Error),
      );
    }));

    it('should not load more when already loading', () => {
      component.loadingMore.set(true);

      component['loadMoreRepositories']();

      expect(mockGitHubService.searchRepositories).not.toHaveBeenCalled();
    });

    it('should not load more when has reached end', () => {
      component.hasReachedEnd.set(true);

      component['loadMoreRepositories']();

      expect(mockGitHubService.searchRepositories).not.toHaveBeenCalled();
    });

    it('should not load more when there is an error', () => {
      component.error.set('Some error');

      component['loadMoreRepositories']();

      expect(mockGitHubService.searchRepositories).not.toHaveBeenCalled();
    });
  });

  describe('canLoadMore', () => {
    it('should return true when conditions are met', () => {
      component.initialLoading.set(false);
      component.loadingMore.set(false);
      component.hasReachedEnd.set(false);
      component.error.set(null);
      component.reposList.set([mockRepository]);

      expect(component['canLoadMore']()).toBe(true);
    });

    it('should return false when loading initially', () => {
      component.initialLoading.set(true);
      component.reposList.set([mockRepository]);

      expect(component['canLoadMore']()).toBe(false);
    });

    it('should return false when loading more', () => {
      component.loadingMore.set(true);
      component.reposList.set([mockRepository]);

      expect(component['canLoadMore']()).toBe(false);
    });

    it('should return false when has reached end', () => {
      component.hasReachedEnd.set(true);
      component.reposList.set([mockRepository]);

      expect(component['canLoadMore']()).toBe(false);
    });

    it('should return false when there is an error', () => {
      component.error.set('Some error');
      component.reposList.set([mockRepository]);

      expect(component['canLoadMore']()).toBe(false);
    });

    it('should return false when repos list is empty', () => {
      component.reposList.set([]);

      expect(component['canLoadMore']()).toBe(false);
    });
  });

  describe('intersection observer', () => {
    let mockIntersectionObserver: jasmine.Spy;
    let mockObserve: jasmine.Spy;
    let mockDisconnect: jasmine.Spy;

    beforeEach(() => {
      mockObserve = jasmine.createSpy('observe');
      mockDisconnect = jasmine.createSpy('disconnect');
      mockIntersectionObserver = jasmine
        .createSpy('IntersectionObserver')
        .and.returnValue({
          observe: mockObserve,
          disconnect: mockDisconnect,
        });

      (window as any).IntersectionObserver = mockIntersectionObserver;
    });

    it('should setup intersection observer after view init', () => {
      const mockElement = { nativeElement: document.createElement('div') };
      component.scrollTrigger = mockElement as ElementRef<HTMLDivElement>;

      component.ngAfterViewInit();

      expect(mockIntersectionObserver).toHaveBeenCalledWith(
        jasmine.any(Function),
        {
          root: null,
          rootMargin: '100px',
          threshold: 0.1,
        },
      );
      expect(mockObserve).toHaveBeenCalledWith(mockElement.nativeElement);
    });

    it('should trigger load more when element intersects and can load more', fakeAsync(() => {
      component.reposList.set([mockRepository]);
      component.initialLoading.set(false);
      component.loadingMore.set(false);
      component.hasReachedEnd.set(false);
      component.error.set(null);

      const mockElement = { nativeElement: document.createElement('div') };
      component.scrollTrigger = mockElement as ElementRef<HTMLDivElement>;

      mockGitHubService.searchRepositories.and.returnValue(
        of(mockPaginatedResult),
      );

      component.ngAfterViewInit();

      const observerCallback =
        mockIntersectionObserver.calls.mostRecent().args[0];

      observerCallback([{ isIntersecting: true }]);

      tick();

      expect(mockGitHubService.searchRepositories).toHaveBeenCalled();
    }));

    it('should not trigger load more when element is not intersecting', () => {
      component.reposList.set([mockRepository]);
      const mockElement = { nativeElement: document.createElement('div') };
      component.scrollTrigger = mockElement as ElementRef<HTMLDivElement>;

      component.ngAfterViewInit();

      const observerCallback =
        mockIntersectionObserver.calls.mostRecent().args[0];
      observerCallback([{ isIntersecting: false }]);

      expect(mockGitHubService.searchRepositories).not.toHaveBeenCalled();
    });

    it('should disconnect observer on destroy', () => {
      const mockElement = { nativeElement: document.createElement('div') };
      component.scrollTrigger = mockElement as ElementRef<HTMLDivElement>;

      component.ngAfterViewInit();
      component.ngOnDestroy();

      expect(mockDisconnect).toHaveBeenCalled();
    });

    it('should handle missing observer on destroy', () => {
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });

  describe('signal reactivity', () => {
    it('should update searchParams when currentPage changes', () => {
      expect(component.searchParams().page).toBe(1);

      component.currentPage.set(3);

      expect(component.searchParams().page).toBe(3);
    });

    it('should update isLoading when loading states change', () => {
      expect(component.isLoading()).toBe(false);

      component.initialLoading.set(true);
      expect(component.isLoading()).toBe(true);

      component.initialLoading.set(false);
      component.loadingMore.set(true);
      expect(component.isLoading()).toBe(true);

      component.loadingMore.set(false);
      expect(component.isLoading()).toBe(false);
    });
  });
});
