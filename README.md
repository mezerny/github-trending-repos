# GithubTrendingRepos
An Angular 20 application that displays trending GitHub repositories from the past 30 days, allowing user to rate and explore repositories.
This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.1.1.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```
## File Naming Convention Note

This project uses Angular 20's new naming convention (e.g., `trending-repo.ts` instead of `trending-repo.component.ts`). I decided to try this approach - didn't love it initially, but wanted to give it a proper evaluation.

## Proposed improvements

### 1. Virtual scrolling for performance optimization

As users scroll through hundreds or thousands of repositories, the DOM becomes bloated with rendered elements leading to increased memory consumption, slower scroll performance and possible browser lag and reduced responsiveness.
As a solution an implementation of the Angular CDK's virtual scrolling.

### 2. E2E testing implementation

To ensure critical user flows and prevent regression bugs it is recommended to implement a set of e2e test.
As a possible solution, a CodeceptJS framework can be used.
