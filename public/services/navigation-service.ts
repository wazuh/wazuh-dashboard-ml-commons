import { Location, Action, History, createBrowserHistory } from 'history';
import { NavigateToAppOptions, CoreStart } from '../../../../src/core/public';

export class NavigationService {
  private constructor(
    private history: History,
    private app: CoreStart['application'],
  ) {}

  static create(app: CoreStart['application']) {
    return new NavigationService(createBrowserHistory(), app);
  }

  public getHistory(): History {
    return this.history;
  }

  public getLocation(): Location {
    return this.history.location;
  }

  public getHash(): string {
    return this.history.location.hash;
  }

  public getPathname(): string {
    return this.history.location.pathname;
  }

  public getSearch(): string {
    return this.history.location.search;
  }

  public getState(): any {
    return this.history.location.state;
  }

  public navigate(path: string, state?: any): void {
    if (!state) {
      this.history.push(path);
    } else {
      this.history.push({
        pathname: path,
        state,
      });
    }
  }

  public replace(path: string, state?: any): void {
    if (!state) {
      this.history.replace(path);
    } else {
      this.history.replace({
        pathname: path,
        state,
      });
    }
  }

  public goBack(): void {
    this.history.goBack();
  }

  public goForward(): void {
    this.history.goForward();
  }

  public go(n: number): void {
    this.history.go(n);
  }

  public reload(): void {
    window.location.reload();
  }

  public listen(
    listener: (location: Location, action: Action) => void,
  ): () => void {
    const unlisten = this.history.listen(listener);
    return unlisten;
  }

  public async navigateToApp(
    appId: string,
    options?: NavigateToAppOptions,
  ): Promise<void> {
    await this.app.navigateToApp(appId, options);
  }

  public async navigateToUrl(url: string): Promise<void> {
    await this.app.navigateToUrl(url);
  }

  public getUrlForApp(
    appId: string,
    options?: { path?: string; absolute?: boolean },
  ): string {
    return this.app.getUrlForApp(appId, options);
  }
}
