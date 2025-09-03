import { useQuery } from '../../../hooks/use-query';
import { getUseCases } from "../../../services/ml-use-cases.service";

export interface UseDeleteModelReturn {
  isDeleting: boolean;
  error: string | null;
  deleteModel: (modelId: string) => Promise<void>;
  reset: () => void;
}

export function useDeleteModel(): UseDeleteModelReturn {
  const { isLoading, error, fetch, reset } = useQuery<void>({
    query: (modelId: string) =>
      getUseCases().deleteModelWithRelatedEntities(modelId),
    initialData: undefined as void,
    defaultErrorMessage: 'Failed to delete model',
  });

  return {
    isDeleting: isLoading,
    error,
    deleteModel: (modelId: string) => fetch(modelId),
    reset,
  };
}
