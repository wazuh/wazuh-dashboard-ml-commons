/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { FC, ReactElement } from 'react';
import { I18nProvider } from '@osd/i18n/react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DataSourceContextProvider } from '../public/contexts';
import { ToastProvider } from '../public/dashboard-assistant/hooks/use-toast';

export const AllTheProviders: FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <I18nProvider>
      <MemoryRouter>
        <DataSourceContextProvider>
          <ToastProvider>{children}</ToastProvider>
        </DataSourceContextProvider>
      </MemoryRouter>
    </I18nProvider>
  );
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
