/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '../../../../test/test_utils';

jest.mock('../model-form', () => {
  const _React = jest.requireActual<typeof import('react')>('react');

  const MockModelForm = ({ onChange, onValidationChange }: any) => {
    _React.useEffect(() => {
      onChange?.({
        modelProvider: 'OpenAI',
        model: 'gpt-4o',
        apiUrl: 'https://api.openai.com/v1/chat/completions',
        apiKey: 'mock-key',
      });
      onValidationChange?.(true);
    }, [onChange, onValidationChange]);

    return _React.createElement('div', { 'data-testid': 'mock-model-form' });
  };

  return {
    __esModule: true,
    ModelForm: MockModelForm,
  };
});

jest.mock('../../modules/installation-manager/hooks/use-assistant-installation', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { ExecutionState } = jest.requireActual<
    typeof import('../../modules/installation-manager/domain')
  >('../../modules/installation-manager/domain');

  const failedStep = {
    stepName: 'Create Model',
    state: ExecutionState.FAILED,
    error: new Error('Model step failed'),
  };

  const progress = {
    getSteps: () => [
      {
        stepName: 'Persist ML Commons settings',
        state: ExecutionState.FINISHED_SUCCESSFULLY,
      },
      failedStep,
    ],
    getFailedSteps: () => [failedStep],
    isFinished: () => false,
    isFinishedSuccessfully: () => false,
    isFinishedWithWarnings: () => false,
    hasFailed: () => true,
  };

  return {
    __esModule: true,
    useAssistantInstallation: () => {
      const [error, setError] = React.useState<string | undefined>(undefined);

      const install = React.useCallback(async () => {
        setError('Steps: "Create Model" has failed');
      }, []);

      return {
        install,
        setModel: jest.fn(),
        reset: jest.fn(),
        isLoading: false,
        error,
        result: { success: false, rollbacks: ['Create Agent', 'Create Connector'] },
        modelData: undefined,
        progress,
        isSuccess: false,
      };
    },
  };
});

import { ModelRegister } from '../model-register';

describe('ModelRegister', () => {
  it('does not show success toast when installation fails', async () => {
    const user = userEvent.setup();

    render(<ModelRegister />);

    const deployButton = await screen.findByRole('button', { name: /Deploy/i });
    expect(deployButton).toBeEnabled();

    await user.click(deployButton);

    await screen.findByText(/Error deploying model/i);

    await waitFor(() => {
      expect(screen.queryByText('Model deployed successfully.')).not.toBeInTheDocument();
    });

    expect(await screen.findByText(/Rollback summary/i)).toBeInTheDocument();
    expect(
      await screen.findByText(/Reverted steps: Create Agent, Create Connector/i)
    ).toBeInTheDocument();
  });
});
