/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '../../../../test/test_utils';
import { ModelDeploymentTable, ModelDeploymentTableProps } from '../model_deployment_table';

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
      />
    );

    // Find Actions column index
    const headers = screen.getAllByRole('columnheader');
    const actionsIndex = headers.findIndex((h) => within(h).queryByText('Actions'));
    const rows = headers[0].closest('table')?.querySelectorAll('tbody tr') as NodeListOf<
      HTMLElement
    >;

    // Helper to get the Actions cell for a row
    const cellAt = (rowIdx: number) =>
      rows[rowIdx].querySelectorAll('td')[actionsIndex] as HTMLElement;

    // Row 0: Use should be enabled
    const use0 = within(cellAt(0)).queryByRole('button', { name: /use model/i });
    if (!use0) {
      const all0 = within(cellAt(0)).getByRole('button', { name: /all actions/i });
      await user.click(all0);
      const useInMenu = (await screen
        .findByRole('button', { name: /use model/i })
        .catch(
          async () => await screen.findByRole('menuitem', { name: /use model/i })
        )) as HTMLElement;
      expect(useInMenu).toBeEnabled();
      // close popover after checking
      await user.click(all0);
    } else {
      expect(use0).toBeEnabled();
    }

    // Row 1: Use should be disabled
    let use1 = within(cellAt(1)).queryByRole('button', { name: /use model/i });
    if (!use1) {
      const all1 = within(cellAt(1)).getByRole('button', { name: /all actions/i });
      await user.click(all1);
      use1 = (await screen
        .findByRole('menuitem', { name: /use model/i })
        .catch(
          async () => await screen.findByRole('button', { name: /use model/i })
        )) as HTMLElement;
      expect(use1).toBeDisabled();
      await user.click(all1);
    } else {
      expect(use1).toBeDisabled();
    }

    // Row 2: Use should be disabled
    let use2 = within(cellAt(2)).queryByRole('button', { name: /use model/i });
    if (!use2) {
      const all2 = within(cellAt(2)).getByRole('button', { name: /all actions/i });
      await user.click(all2);
      use2 = (await screen
        .findByRole('menuitem', { name: /use model/i })
        .catch(
          async () => await screen.findByRole('button', { name: /use model/i })
        )) as HTMLElement;
      expect(use2).toBeDisabled();
      await user.click(all2);
    } else {
      expect(use2).toBeDisabled();
    }

    // Invoke onUseModel from row 0
    if (use0) {
      await user.click(use0);
    } else {
      const all0 = within(cellAt(0)).getByRole('button', { name: /all actions/i });
      await user.click(all0);
      const menuUse0 = (await screen
        .findByRole('button', { name: /use model/i })
        .catch(
          async () => await screen.findByRole('menuitem', { name: /use model/i })
        )) as HTMLElement;
      await user.click(menuUse0);
    }
    expect(onUseModel).toHaveBeenCalledWith(items[0]);

    // Test action (always enabled) – click row 2
    let test2 = within(cellAt(2)).queryByRole('button', { name: /test model/i });
    if (!test2) {
      const all2 = within(cellAt(2)).getByRole('button', { name: /all actions/i });
      await user.click(all2);
      test2 = (await screen
        .findByRole('menuitem', { name: /test model/i })
        .catch(
          async () => await screen.findByRole('button', { name: /test model/i })
        )) as HTMLElement;
    }
    await user.click(test2!);
    expect(onTestModel).toHaveBeenCalledWith(items[2]);
  }, 30000);
});
