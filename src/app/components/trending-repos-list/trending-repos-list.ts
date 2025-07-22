import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { GitHubRepoService } from '../../services/github-repo-service';
import { GitHubRepository, SearchParams } from '../../types/github.types';
import { CommonModule } from '@angular/common';
import { TrendingRepo } from '../trending-repo/trending-repo';

@Component({
  selector: 'app-trending-repos-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TrendingRepo],
  templateUrl: './trending-repos-list.html',
  styleUrl: './trending-repos-list.less',
})
export class TrendingReposList implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('scrollTrigger') scrollTrigger!: ElementRef<HTMLDivElement>;
  // Signals for state management
  readonly reposList = signal<GitHubRepository[]>([]);
  readonly initialLoading = signal(false);
  readonly loadingMore = signal(false);
  readonly error = signal<string | null>(null);
  readonly currentPage = signal(1);
  readonly totalCount = signal(0);
  readonly hasReachedEnd = signal(false);
  // Computed for search parameters
  readonly searchParams = computed<SearchParams>(() => ({
    page: this.currentPage(),
    perPage: 30,
  }));
  // Computed to determine if we're currently loading anything
  readonly isLoading = computed(
    () => this.initialLoading() || this.loadingMore(),
  );
  private readonly githubService = inject(GitHubRepoService);
  private intersectionObserver?: IntersectionObserver;

  ngOnInit(): void {
    this.loadInitialRepositories();
  }

  ngAfterViewInit(): void {
    this.setupIntersectionObserver();
  }

  ngOnDestroy(): void {
    this.intersectionObserver?.disconnect();
  }

  retry(): void {
    this.error.set(null);
    this.hasReachedEnd.set(false);
    this.currentPage.set(1);
    this.reposList.set([]);
    this.loadInitialRepositories();
  }

  private setupIntersectionObserver(): void {
    const options: IntersectionObserverInit = {
      root: null,
      rootMargin: '100px', // Trigger 100px before reaching the element
      threshold: 0.1,
    };

    this.intersectionObserver = new IntersectionObserver((entries) => {
      const target = entries[0];
      if (target.isIntersecting && this.canLoadMore()) {
        this.loadMoreRepositories();
      }
    }, options);

    this.intersectionObserver.observe(this.scrollTrigger.nativeElement);
  }

  private canLoadMore(): boolean {
    return (
      !this.isLoading() &&
      !this.hasReachedEnd() &&
      !this.error() &&
      this.reposList().length > 0
    );
  }

  private loadInitialRepositories(): void {
    this.initialLoading.set(true);
    this.error.set(null);

    this.githubService.searchRepositories(this.searchParams()).subscribe({
      next: (result) => {
        this.reposList.set(result.data);
        this.totalCount.set(result.totalCount);
        this.hasReachedEnd.set(!result.hasNext);
        this.initialLoading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load repositories. Please try again.');
        this.initialLoading.set(false);
        console.error('Error loading initial repositories:', err);
      },
    });
  }

  private loadMoreRepositories(): void {
    if (!this.canLoadMore()) return;

    this.loadingMore.set(true);
    this.currentPage.update((page) => page + 1);

    this.githubService.searchRepositories(this.searchParams()).subscribe({
      next: (result) => {
        // Append new repositories to existing ones
        this.reposList.update((current) => [...current, ...result.data]);
        this.hasReachedEnd.set(!result.hasNext);
        this.loadingMore.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load more repositories. Please try again.');
        this.loadingMore.set(false);
        // Revert page increment on error
        this.currentPage.update((page) => Math.max(1, page - 1));
        console.error('Error loading more repositories:', err);
      },
    });
  }
}
