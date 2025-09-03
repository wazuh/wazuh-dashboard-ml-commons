import { PLUGIN_ID } from '../../../common';
import { routerPaths } from '../../../common/router_paths';
import { NavigationService } from '../../services/navigation-service';

export class AssistantNavigationService {
  private static _navigationService?: NavigationService;

  static setup(navigationService: NavigationService) {
    this._navigationService = navigationService;
  }

  static destroy() {
    this._navigationService = undefined;
  }

  static get navigationService() {
    if (!this._navigationService) {
      throw new Error(`${AssistantNavigationService.name} is not initialized`);
    }
    return this._navigationService;
  }

  static getRedirectUrl(path: string) {
    return this.navigationService.getUrlForApp(PLUGIN_ID, {
      path,
    });
  }

  static goHome() {
    this.navigationService.navigate(routerPaths.root);
  }

  static getRegisterModelUrl() {
    return this.getRedirectUrl(routerPaths.registerModel);
  }
}
