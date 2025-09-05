/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test/test_utils';
import {
  ModelDeploymentTable,
  ModelDeploymentTableProps,
} from '../model_deployment_table';

describe('Model Use and Test actions', () => {
  const baseItem = {
    respondingNodesCount: 1,
    notRespondingNodesCount: 0,
    planningNodesCount: 1,
    planningWorkerNodes: [] as string[],
  };

  it('enables Use only when agentId exists and not in use; invokes callbacks', async () => {
    const onUseModel = jest.fn();
    const onTestModel = jest.fn();
    const user = userEvent.setup();

    const items: ModelDeploymentTableProps['items'] = [
      {
        ...baseItem,
        id: 'm-1',
        name: 'Has Agent',
        agentId: 'a-1',
        inUse: false,
      },
      { ...baseItem, id: 'm-2', name: 'In Use', agentId: 'a-2', inUse: true },
      { ...baseItem, id: 'm-3', name: 'No Agent' },
    ];

    render(
      <ModelDeploymentTable
        items={items}
        sort={{ field: 'name', direction: 'asc' }}
        onChange={jest.fn()}
        onUseModel={onUseModel}
        onTestModel={onTestModel}
      />,
    );

    const useButtons = screen.getAllByRole('button', { name: 'use model' });
    expect(useButtons).toHaveLength(3);
    expect(useButtons[0]).toBeEnabled();
    expect(useButtons[1]).toBeDisabled();
    expect(useButtons[2]).toBeDisabled();

    await user.click(useButtons[0]);
    expect(onUseModel).toHaveBeenCalledWith(items[0]);

    const testButtons = screen.getAllByRole('button', { name: 'test model' });
    expect(testButtons).toHaveLength(3);
    expect(testButtons[0]).toBeEnabled();
    expect(testButtons[1]).toBeEnabled();
    expect(testButtons[2]).toBeEnabled();

    await user.click(testButtons[2]);
    expect(onTestModel).toHaveBeenCalledWith(items[2]);
  });
});
