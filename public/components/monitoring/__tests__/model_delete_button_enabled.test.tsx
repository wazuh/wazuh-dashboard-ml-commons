/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../../../../test/test_utils';
import { ModelDeploymentTable, ModelDeploymentTableProps } from '../model_deployment_table';

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
      />
    );

    // Delete action may be inline or under the "All actions" popover depending on layout.
    let deleteAction = screen.queryByRole('button', { name: /delete model/i });
    if (!deleteAction) {
      const allActionsBtn = screen.getByRole('button', { name: /all actions/i });
      await user.click(allActionsBtn);
      // In the popover, actions are often rendered as menu items, but may also be buttons.
      deleteAction =
        screen.queryByRole('menuitem', { name: /delete model/i }) ||
        screen.queryByRole('button', { name: /delete model/i });
      if (!deleteAction) {
        // Wait briefly in case the popover renders asynchronously
        deleteAction = await screen
          .findByRole('menuitem', { name: /delete model/i })
          .catch(async () => {
            return await screen.findByRole('button', { name: /delete model/i });
          });
      }
    }

    expect(deleteAction).toBeEnabled();
    await user.click(deleteAction!);

    expect(onDeleteModel).toHaveBeenCalledWith(items[0]);
  });
});
