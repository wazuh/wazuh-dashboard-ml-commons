/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useQuery } from '../../../hooks/use-query';
import { getUseCases } from '../../../services/ml-use-cases.service';

export interface UseDeleteModelReturn {
  isDeleting: boolean;
  error: string | null;
  deleteModel: (modelId: string) => Promise<void>;
  reset: () => void;
}

export function useDeleteModel(): UseDeleteModelReturn {
  const { isLoading, error, fetch, reset } = useQuery<void>({
    query: (modelId: string) => getUseCases().deleteModelWithRelatedEntities(modelId),
    initialData: undefined as void,
    defaultErrorMessage: 'Failed to delete model',
    toasts: {
      getSuccess: ({ params }) => ({
        title: 'Model deleted',
        text: `Model ID "${params}" has been successfully deleted.`,
      }),
      getError: ({ error: modelDeletionError }) => ({
        title: 'Error deleting model',
        text: modelDeletionError,
      }),
    },
  });

  return {
    isDeleting: isLoading,
    error,
    deleteModel: (modelId: string) => fetch(modelId),
    reset,
  };
}
