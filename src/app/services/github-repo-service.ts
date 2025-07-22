import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import {
  GitHubRepository,
  GitHubSearchResponse,
  PaginatedResult,
  SearchParams,
} from '../types/github.types';

@Injectable({
  providedIn: 'root',
})
export class GitHubRepoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://api.github.com/search/repositories';
  private readonly defaultPerPage = 30;
  private readonly maxPerPage = 100;

  searchRepositories(
    searchParams: SearchParams = {},
  ): Observable<PaginatedResult<GitHubRepository>> {
    const {
      startDate = this.getDefaultStartDate(),
      page = 1,
      perPage = this.defaultPerPage,
    } = searchParams;

    // Validate parameters
    const validatedPage = Math.max(1, page);
    const validatedPerPage = Math.min(Math.max(1, perPage), this.maxPerPage);

    const params = this.buildHttpParams(
      startDate,
      validatedPage,
      validatedPerPage,
    );

    return this.http
      .get<GitHubSearchResponse>(this.baseUrl, { params })
      .pipe(
        map((response) =>
          this.mapToPaginatedResult(response, validatedPage, validatedPerPage),
        ),
      );
  }

  private buildHttpParams(
    startDate: string,
    page: number,
    perPage: number,
  ): HttpParams {
    return new HttpParams()
      .set('q', `created:>${startDate}`)
      .set('sort', 'stars')
      .set('order', 'desc')
      .set('page', page.toString())
      .set('per_page', perPage.toString());
  }

  private mapToPaginatedResult(
    response: GitHubSearchResponse,
    currentPage: number,
    perPage: number,
  ): PaginatedResult<GitHubRepository> {
    const totalPages = Math.ceil(response.total_count / perPage);

    return {
      data: response.items,
      totalCount: response.total_count,
      currentPage,
      totalPages,
      hasNext: currentPage < totalPages,
      hasPrevious: currentPage > 1,
    };
  }

  private getDefaultStartDate(): string {
    const thirtyDaysAgoISOString = new Date(
      new Date().setDate(new Date().getDate() - 30),
    ).toISOString();
    return thirtyDaysAgoISOString.substring(
      0,
      thirtyDaysAgoISOString.indexOf('T'),
    );
  }
}
