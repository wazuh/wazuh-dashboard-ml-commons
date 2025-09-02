import NavigationService from '../../../../main/public/react-services/navigation-service';
import { SECTIONS } from '../../../../main/public/sections';
import { dashboardAssistant } from '../../../../main/public/utils/applications';

export class DashboardAssistantNavigationService {
  static getRedirectUrl(path: string) {
    return NavigationService.getInstance().getUrlForApp(dashboardAssistant.id, {
      path: `#${dashboardAssistant.redirectTo(path)}`,
    });
  }

  static Home() {
    NavigationService.getInstance().navigate(dashboardAssistant.id);
  }

  static RegisterModel() {
    return DashboardAssistantNavigationService.getRedirectUrl(
      SECTIONS.REGISTER_MODEL,
    );
  }
}
