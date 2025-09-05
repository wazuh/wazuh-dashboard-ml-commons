/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '../../../../test/test_utils';
import { Monitoring } from '../index';
import * as useMonitoringExports from '../use_monitoring';
import {
  applicationServiceMock,
  chromeServiceMock,
} from '../../../../../../src/core/public/mocks';
import { navigationPluginMock } from '../../../../../../src/plugins/navigation/public/mocks';

// Mock uiSetting hook used internally
jest.mock(
  '../../../../../../src/plugins/opensearch_dashboards_react/public',
  () => ({
    useUiSetting: jest.fn().mockReturnValue(false),
  }),
);

// Wire deleteModel to a jest.fn so we can assert calls
// Note: variable name starts with `mock` to satisfy Jest's hoisting rule
let mockDeleteModel = jest.fn();

jest.mock('../../../dashboard-assistant/modules/model/hooks', () => ({
  useModelTest: () => ({
    isLoading: false,
    response: null,
    error: null,
    testModel: jest.fn(),
    reset: jest.fn(),
  }),
  useDeleteModel: () => ({
    isDeleting: false,
    error: null,
    deleteModel: mockDeleteModel,
    reset: jest.fn(),
  }),
  useModel: () => ({
    activateModel: jest.fn(),
  }),
}));

const setup = () => {
  mockDeleteModel = jest.fn();

  const applicationStartMock = applicationServiceMock.createStartContract();
  const chromeStartMock = chromeServiceMock.createStartContract();
  const navigationStartMock = navigationPluginMock.createStartContract();
  navigationStartMock.ui.HeaderControl = () => null;

  const reloadMock = jest.fn();

  jest.spyOn(useMonitoringExports, 'useMonitoring').mockReturnValue({
    params: {
      currentPage: 1,
      pageSize: 15,
      sort: { field: 'name', direction: 'asc' },
      connector: [],
      source: [],
    },
    pageStatus: 'normal',
    pagination: {
      currentPage: 1,
      pageSize: 15,
      totalRecords: 1,
      totalPages: 1,
    },
    deployedModels: [
      {
        id: 'model-1-id',
        name: 'model 1 name',
        respondingNodesCount: 1,
        notRespondingNodesCount: 0,
        planningNodesCount: 0,
        planningWorkerNodes: [],
      },
    ],
    allExternalConnectors: [],
    reload: reloadMock,
    searchByNameOrId: jest.fn(),
    searchByStatus: jest.fn(),
    searchByConnector: jest.fn(),
    searchBySource: jest.fn(),
    updateDeployedModel: jest.fn(),
    resetSearch: jest.fn(),
    handleTableChange: jest.fn(),
  } as any);

  const user = userEvent.setup();

  render(
    <Monitoring
      application={applicationStartMock}
      chrome={chromeStartMock}
      navigation={navigationStartMock}
      useNewPageHeader={false}
    />,
  );

  return { user, reloadMock };
};

describe('Delete model confirmation modal', () => {
  // Ensure real timers for async utilities like findBy/waitFor
  beforeEach(() => {
    jest.useRealTimers();
  });
  it('requires typing model name to enable deletion and triggers delete on confirm', async () => {
    const { user, reloadMock } = setup();

    // Open confirmation modal by clicking the row delete button
    await user.click(
      screen.getAllByRole('button', { name: 'delete model' })[0],
    );

    // Modal may not expose role=dialog in JSDOM; assert heading exists
    expect(
      await screen.findByRole('heading', { name: 'Delete model: model 1 name' })
    ).toBeInTheDocument();

    const confirmButton = screen.getByRole('button', { name: 'Delete model' });
    expect(confirmButton).toBeDisabled();

    const input = screen.getByRole('textbox', {
      name: 'Type "model 1 name" to confirm',
    });
    await user.type(input, 'wrong name');
    expect(confirmButton).toBeDisabled();

    // Type correct confirmation
    await user.clear(input);
    await user.type(input, 'model 1 name');
    await waitFor(() => expect(confirmButton).not.toBeDisabled());

    await user.click(confirmButton);

    expect(mockDeleteModel).toHaveBeenCalledWith('model-1-id');
    expect(reloadMock).toHaveBeenCalled();
  });
});
