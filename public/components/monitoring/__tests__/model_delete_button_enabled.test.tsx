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

describe('Model delete button', () => {
  it('is enabled even when model is in use and invokes onDeleteModel', async () => {
    const onDeleteModel = jest.fn();
    const user = userEvent.setup();
    const items: ModelDeploymentTableProps['items'] = [
      {
        id: 'm-1',
        name: 'My Model',
        inUse: true,
        respondingNodesCount: 1,
        notRespondingNodesCount: 0,
        planningNodesCount: 0,
        planningWorkerNodes: [],
      },
    ];

    render(
      <ModelDeploymentTable
        items={items}
        sort={{ field: 'name', direction: 'asc' }}
        onChange={jest.fn()}
        onDeleteModel={onDeleteModel}
      />,
    );

    const deleteBtn = screen.getByRole('button', { name: 'delete model' });
    expect(deleteBtn).toBeEnabled();
    await user.click(deleteBtn);

    expect(onDeleteModel).toHaveBeenCalledWith(items[0]);
  });
});
