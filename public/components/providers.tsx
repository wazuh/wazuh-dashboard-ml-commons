/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { I18nProvider } from '@osd/i18n/react';
import {
  DataSourceContextProvider,
  DataSourceContextProviderProps,
} from '../contexts/data_source_context';
import { ToastProvider } from '../dashboard-assistant/hooks/use-toast';

interface ProvidersProps {
  initialValue: DataSourceContextProviderProps['initialValue'];
}

const Providers: React.FC<ProvidersProps> = ({ children, initialValue }) => {
  return (
    <I18nProvider>
      <DataSourceContextProvider initialValue={initialValue}>
        <ToastProvider>{children}</ToastProvider>
      </DataSourceContextProvider>
    </I18nProvider>
  );
};

export { Providers };
