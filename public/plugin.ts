/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { i18n } from '@osd/i18n';
import {
  AppMountParameters,
  CoreSetup,
  CoreStart,
  DEFAULT_NAV_GROUPS,
  Plugin,
} from '../../../src/core/public';
import {
  MlCommonsPluginPluginSetup,
  MlCommonsPluginPluginStart,
  AppPluginStartDependencies,
  MLServices,
  MlCommonsPluginPluginSetupDependencies,
} from './types';
import { PLUGIN_NAME, PLUGIN_ID } from '../common';
import { AssistantNavigationService } from './dashboard-assistant/services/assistant-navigation.service';
import { NavigationService } from './services/navigation-service';
import {
  setHttpClient,
  setProxyHttpClient,
} from './dashboard-assistant/services/common';
import { AxiosHttpClient } from './dashboard-assistant/modules/common/http/infrastructure/axios-http-client';
import { ProxyHttpClient } from './dashboard-assistant/modules/common/http/infrastructure/proxy-http-client';
import type { HttpClient } from './dashboard-assistant/modules/common/http/domain/entities/http-client';

export class MlCommonsPluginPlugin
  implements Plugin<MlCommonsPluginPluginSetup, MlCommonsPluginPluginStart>
{
  public setup(
    core: CoreSetup<AppPluginStartDependencies, AppPluginStartDependencies>,
    {
      dataSource,
      dataSourceManagement,
    }: MlCommonsPluginPluginSetupDependencies,
  ): MlCommonsPluginPluginSetup {
    // Register an application into the side navigation menu
    core.application.register({
      id: PLUGIN_ID,
      title: PLUGIN_NAME,
      description: i18n.translate(
        'MLCommonsDashboards.application.aiModels.description',
        {
          defaultMessage: 'Review  the status of running AI models.',
        },
      ),
      category: {
        id: 'opensearch',
        label: 'OpenSearch Plugins',
      },
      async mount(params: AppMountParameters) {
        // Load application bundle
        const { renderApp } = await import('./application');
        // Get start services as specified in opensearch_dashboards.json
        const [coreStart, pluginsStart] = await core.getStartServices();
        const { data, navigation } = pluginsStart;

        const services: MLServices = {
          ...coreStart,
          data,
          navigation,
          history: params.history,
          dataSource,
          dataSourceManagement,
          setHeaderActionMenu: params.setHeaderActionMenu,
        };
        // Render the application
        return renderApp(params, services);
      },
    });

    core.chrome.navGroup.addNavLinksToGroup(
      DEFAULT_NAV_GROUPS.dataAdministration,
      [
        {
          id: PLUGIN_ID,
          title: i18n.translate('MLCommonsDashboards.NavLink.AIModels.title', {
            defaultMessage: 'AI models',
          }),
          category: {
            id: 'ai-models',
            label: i18n.translate(
              'MLCommonsDashboards.Category.MachineLearning.label',
              {
                defaultMessage: 'Machine learning',
              },
            ),
            order: 9999,
          },
        },
      ],
    );

    // Return methods that should be available to other plugins
    return {};
  }

  public start(core: CoreStart): MlCommonsPluginPluginStart {
    const httpClient: HttpClient = new AxiosHttpClient();
    setHttpClient(httpClient);
    setProxyHttpClient(new ProxyHttpClient(httpClient));
    AssistantNavigationService.setup(
      NavigationService.create(core.application),
    );
    return {};
  }

  public stop() {
    setHttpClient(undefined);
    setProxyHttpClient(undefined);
    AssistantNavigationService.destroy();
  }
}
