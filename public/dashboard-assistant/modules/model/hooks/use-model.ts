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
  const registerAgentQuery = useCallback(async (agentId: string) => {
    await getUseCases().registerAgent(agentId);
    // small delay to allow config index update
    await new Promise(r => setTimeout(r, 500));
    if (options?.onSuccess) {
      await options.onSuccess();
    }
  }, [options]);

  const { isLoading, error, fetch, reset } = useQuery<void>({
    query: registerAgentQuery,
    initialData: undefined as void,
    defaultErrorMessage: 'Unknown error',
    toasts: {
      getSuccess: ({ params }) => ({
        title: 'Agent registered',
        text: `Agent ID "${params}" is now active.`,
      }),
      getError: ({ error }) => ({
        title: 'Error registering agent',
        text: error,
      }),
    },
  });

  const activateModel = useCallback(
    async (agentId: string) => fetch(agentId),
    [fetch]
  );

  return {
    isUsing: isLoading,
    error,
    activateModel,
    reset,
  };
}

