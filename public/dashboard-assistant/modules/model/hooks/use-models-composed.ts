import { useEffect } from 'react';
import { ModelsComposed } from '../application/dtos/models-composed';
import { useQuery } from '../../../hooks/use-query';
import { getUseCases } from "../../../services/ml-use-cases.service";

interface UseModelsComposed {
  models: ModelsComposed[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useModelsComposed(): UseModelsComposed {
  const { data, error, isLoading, fetch } = useQuery<ModelsComposed[]>({
    query() {
      return getUseCases().getModelsComposed();
    },
    initialData: [],
    defaultErrorMessage: 'Failed to fetch models data',
  });

  useEffect(() => {
    fetch();
  }, []);

  return {
    models: data,
    isLoading,
    error: error,
    refresh: fetch,
  };
}
