/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ModelPredictResponse } from '../domain/types';
import { useQuery } from '../../../hooks/use-query';
import { getUseCases } from '../../../services/ml-use-cases.service';

interface UseModelTestReturn {
  isLoading: boolean;
  response: ModelPredictResponse | null;
  error: string | null;
  testModel: (modelId: string) => Promise<void>;
  reset: () => void;
}

export function useModelTest(): UseModelTestReturn {
  const { data: response, error, isLoading, fetch, reset } = useQuery<ModelPredictResponse | null>({
    query(modelId: string) {
      return getUseCases().validateModelConnection(modelId);
    },
    initialData: null,
    defaultErrorMessage: 'Failed to test model connection',
  });

  return {
    isLoading,
    response,
    error,
    testModel: fetch,
    reset,
  };
}
