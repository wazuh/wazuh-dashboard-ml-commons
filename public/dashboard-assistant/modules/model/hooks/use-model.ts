/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

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
  const { isLoading, error, fetch, reset } = useQuery<void>({
    query: (agentId: string) => getUseCases().useAgent(agentId),
    initialData: undefined as void,
    defaultErrorMessage: 'Unknown error',
    toasts: {
      getSuccess: ({ params }) => {
        options?.onSuccess?.();
        return {
          title: 'Agent registered',
          text: `Agent ID "${params}" is now active.`,
        };
      },
      getError: ({ error: agentRegistrationError }) => ({
        title: 'Error registering agent',
        text: agentRegistrationError,
      }),
    },
  });

  return {
    isUsing: isLoading,
    error,
    activateModel: fetch,
    reset,
  };
}
