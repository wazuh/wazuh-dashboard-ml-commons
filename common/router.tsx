/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useHistory } from 'react-router-dom';
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
    Component: (props) => {
      const { push } = useHistory();

      const handleCancel = () => {
        push(routerPaths.overview);
      };

      const handleDeployed = () => {
        push(routerPaths.overview);
      };

      return <ModelRegister {...props} onCancel={handleCancel} onDeployed={handleDeployed} />;
    },
    label: 'Register Model',
  },
];
