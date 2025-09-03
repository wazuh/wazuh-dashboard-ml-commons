/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { Monitoring } from '../public/components/monitoring';
import { ModelRegister } from '../public/dashboard-assistant/components/model-register';
import { routerPaths } from './router_paths';

interface RouteConfig {
  path: string;
  Component: React.FC<any>;
  label: string;
  exact?: boolean;
}

export const ROUTES: RouteConfig[] = [
  {
    path: routerPaths.overview,
    Component: Monitoring,
    label: 'Overview',
  },
  {
    path: routerPaths.registerModel,
    Component: ModelRegister,
    label: 'Register Model',
  },
];
