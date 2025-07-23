import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { GitHubRepoService } from './github-repo-service';
import { GitHubSearchResponse, GitHubRepository } from '../types/github.types';
import { provideHttpClient } from '@angular/common/http';

describe('GitHubRepoService', () => {
  let service: GitHubRepoService;
  let httpMock: HttpTestingController;

  const mockRepository: GitHubRepository = {
    id: 1,
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
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    open_issues_count: 20,

  };

  const mockSearchResponse: GitHubSearchResponse = {
    total_count: 150,
    incomplete_results: false,
    items: [mockRepository]
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        GitHubRepoService
      ]
    });

    service = TestBed.inject(GitHubRepoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('searchRepositories', () => {
    it('should search repositories with default parameters', () => {
      service.searchRepositories().subscribe(result => {
        expect(result.data).toEqual([mockRepository]);
        expect(result.totalCount).toBe(150);
        expect(result.currentPage).toBe(1);
        expect(result.totalPages).toBe(5);
        expect(result.hasNext).toBe(true);
        expect(result.hasPrevious).toBe(false);
      });

      const req = httpMock.expectOne((request) => {
        return request.url === 'https://api.github.com/search/repositories';
      });

      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('sort')).toBe('stars');
      expect(req.request.params.get('order')).toBe('desc');
      expect(req.request.params.get('page')).toBe('1');
      expect(req.request.params.get('per_page')).toBe('30');
      expect(req.request.params.get('q')).toMatch(/created:>\d{4}-\d{2}-\d{2}/);

      req.flush(mockSearchResponse);
    });

    it('should use custom search parameters', () => {
      const customParams = {
        startDate: '2024-01-01',
        page: 2,
        perPage: 50
      };

      service.searchRepositories(customParams).subscribe(result => {
        expect(result.currentPage).toBe(2);
        expect(result.totalPages).toBe(3);
        expect(result.hasNext).toBe(true);
        expect(result.hasPrevious).toBe(true);
      });

      const req = httpMock.expectOne((request) => {
        return request.url === 'https://api.github.com/search/repositories';
      });

      expect(req.request.params.get('q')).toBe('created:>2024-01-01');
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('per_page')).toBe('50');

      req.flush(mockSearchResponse);
    });

    it('should validate and correct page parameter', () => {
      service.searchRepositories({ page: -5 }).subscribe();

      const req = httpMock.expectOne((request) => {
        return request.url === 'https://api.github.com/search/repositories';
      });

      expect(req.request.params.get('page')).toBe('1');
      req.flush(mockSearchResponse);
    });

    it('should validate and correct perPage parameter', () => {
      service.searchRepositories({ perPage: 150 }).subscribe();

      const req = httpMock.expectOne((request) => {
        return request.url === 'https://api.github.com/search/repositories';
      });

      expect(req.request.params.get('per_page')).toBe('100');
      req.flush(mockSearchResponse);
    });

    it('should validate and correct minimum perPage parameter', () => {
      service.searchRepositories({ perPage: -10 }).subscribe();

      const req = httpMock.expectOne((request) => {
        return request.url === 'https://api.github.com/search/repositories';
      });

      expect(req.request.params.get('per_page')).toBe('1');
      req.flush(mockSearchResponse);
    });

    it('should handle last page correctly', () => {
      const lastPageResponse = {
        ...mockSearchResponse,
        total_count: 60
      };

      service.searchRepositories({ page: 2, perPage: 30 }).subscribe(result => {
        expect(result.hasNext).toBe(false);
        expect(result.hasPrevious).toBe(true);
        expect(result.totalPages).toBe(2);
      });

      const req = httpMock.expectOne((request) => {
        return request.url === 'https://api.github.com/search/repositories';
      });

      req.flush(lastPageResponse);
    });

    it('should handle single page results', () => {
      const singlePageResponse = {
        ...mockSearchResponse,
        total_count: 10
      };

      service.searchRepositories({ page: 1, perPage: 30 }).subscribe(result => {
        expect(result.hasNext).toBe(false);
        expect(result.hasPrevious).toBe(false);
        expect(result.totalPages).toBe(1);
      });

      const req = httpMock.expectOne((request) => {
        return request.url === 'https://api.github.com/search/repositories';
      });

      req.flush(singlePageResponse);
    });

    it('should handle empty results', () => {
      const emptyResponse: GitHubSearchResponse = {
        total_count: 0,
        incomplete_results: false,
        items: []
      };

      service.searchRepositories().subscribe(result => {
        expect(result.data).toEqual([]);
        expect(result.totalCount).toBe(0);
        expect(result.totalPages).toBe(0);
        expect(result.hasNext).toBe(false);
        expect(result.hasPrevious).toBe(false);
      });

      const req = httpMock.expectOne((request) => {
        return request.url === 'https://api.github.com/search/repositories';
      });

      req.flush(emptyResponse);
    });

    it('should handle HTTP errors', () => {
      service.searchRepositories().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne((request) => {
        return request.url === 'https://api.github.com/search/repositories';
      });

      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });

    it('should generate correct default start date', () => {
      const mockDate = new Date('2024-02-15T12:00:00Z');
      jasmine.clock().install();
      jasmine.clock().mockDate(mockDate);

      service.searchRepositories().subscribe();

      const req = httpMock.expectOne((request) => {
        return request.url === 'https://api.github.com/search/repositories';
      });

      expect(req.request.params.get('q')).toBe('created:>2024-01-16');
      req.flush(mockSearchResponse);

      jasmine.clock().uninstall();
    });

    it('should use exact date format for start date', () => {
      service.searchRepositories({ startDate: '2024-01-01' }).subscribe();

      const req = httpMock.expectOne((request) => {
        return request.url === 'https://api.github.com/search/repositories';
      });

      expect(req.request.params.get('q')).toBe('created:>2024-01-01');
      req.flush(mockSearchResponse);
    });
  });
});
