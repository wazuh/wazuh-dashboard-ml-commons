/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '../../../../test/test_utils';
import { DeleteModelModal } from '../';

// Wire deleteModel to a jest.fn so we can assert calls
// Note: variable name starts with `mock` to satisfy Jest's hoisting rule
let mockDeleteModel = jest.fn();

jest.mock('../../../dashboard-assistant/modules/model/hooks', () => ({
  useDeleteModel: () => ({
    isDeleting: false,
    error: null,
    deleteModel: mockDeleteModel,
    reset: jest.fn(),
  }),
}));

describe('<DeleteModelModal />', () => {
  beforeEach(() => {
    jest.useRealTimers();
    mockDeleteModel = jest.fn();
  });

  it('requires typing model name to enable deletion and triggers delete on confirm', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    const onDeleted = jest.fn();

    render(
      <DeleteModelModal
        model={{
          id: 'model-1-id',
          name: 'model 1 name',
          respondingNodesCount: 1,
          notRespondingNodesCount: 0,
          planningNodesCount: 0,
          planningWorkerNodes: [],
        }}
        onClose={onClose}
        onDeleted={onDeleted}
      />
    );

    expect(
      await screen.findByRole('heading', {
        name: 'Delete model: model 1 name',
      })
    ).toBeInTheDocument();

    const confirmButton = screen.getByRole('button', { name: 'Delete model' });
    expect(confirmButton).toBeDisabled();

    const input = screen.getByRole('textbox', {
      name: 'Type "model 1 name" to confirm',
    });
    await user.type(input, 'wrong name');
    expect(confirmButton).toBeDisabled();

    await user.clear(input);
    await user.type(input, 'model 1 name');
    await waitFor(() => expect(confirmButton).not.toBeDisabled());

    await user.click(confirmButton);

    expect(mockDeleteModel).toHaveBeenCalledWith('model-1-id');
    expect(onDeleted).toHaveBeenCalled();
  });
});
