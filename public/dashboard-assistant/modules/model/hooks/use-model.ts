/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback } from 'react';
import { getUseCases } from '../../../services/ml-use-cases.service';
import { useQuery } from '../../../hooks/use-query';

export interface UseModelOptions {
  onSuccess?: () => Promise<void> | void;
}

export interface UseModelReturn {
  isUsing: boolean;
  error: string | null;
  activateModel: (agentId: string) => Promise<void>;
  reset: () => void;
}

export function useModel(options?: UseModelOptions): UseModelReturn {
  const registerAgentQuery = useCallback(
    async (agentId: string) => {
      const useCases = getUseCases();
      await useCases.useAgent(agentId);

      // Wait until the active agent state is visible in subsequent reads
      // This avoids a first-click no-op due to eventual consistency.
      const maxAttempts = 10;
      const delayMs = 300;
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          const modelsWithAgent = await useCases.getModelsWithAgentData();
          const target = modelsWithAgent.find((m) => m.agentId === agentId);
          if (target?.inUse) {
            break;
          }
        } catch (_) {
          // ignore and keep polling briefly
        }
        await new Promise((r) => setTimeout(r, delayMs));
      }

      if (options?.onSuccess) {
        await options.onSuccess();
      }
    },
    [options]
  );

  const { isLoading, error, fetch, reset } = useQuery<void>({
    query: registerAgentQuery,
    initialData: undefined as void,
    defaultErrorMessage: 'Unknown error',
    toasts: {
      getSuccess: ({ params }) => ({
        title: 'Agent registered',
        text: `Agent ID "${params}" is now active.`,
      }),
      getError: ({ error: agentRegistrationError }) => ({
        title: 'Error registering agent',
        text: agentRegistrationError,
      }),
    },
  });

  const activateModel = useCallback(async (agentId: string) => fetch(agentId), [fetch]);

  return {
    isUsing: isLoading,
    error,
    activateModel,
    reset,
  };
}
