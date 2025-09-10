/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useState } from 'react';
import { useToast } from './use-toast';

interface UseFetchDataProps<T> {
  query: (params?: any) => Promise<T>;
  initialData: T;
  defaultErrorMessage: string;
  toasts?: {
    getSuccess?: (ctx: { data: T; params: any }) => { title: string; text?: string } | null;
    getError?: (ctx: { error: string; params: any }) => { title: string; text?: string } | null;
  };
}

interface UseFetchDataReturn<T> {
  data: T;
  isLoading: boolean;
  error: string | null;
  fetch: (params?: any) => Promise<void>;
  reset: () => void;
}

export function useQuery<T>({
  query,
  initialData,
  defaultErrorMessage,
  toasts,
}: UseFetchDataProps<T>): UseFetchDataReturn<T> {
  const { addSuccessToast, addErrorToast } = useToast();
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeQuery = useCallback(
    async (params: any) => {
      setIsLoading(true);
      setData(initialData);
      setError(null);

      try {
        const queryResult = await query(params);
        setData(queryResult);
        if (toasts?.getSuccess) {
          const toast = toasts.getSuccess({ data: queryResult, params });
          if (toast) {
            addSuccessToast(toast.title, toast.text);
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : defaultErrorMessage;
        setError(errorMessage);
        if (toasts?.getError) {
          const toast = toasts.getError({ error: errorMessage, params });
          if (toast) {
            addErrorToast(toast.title, toast.text);
          }
        }
      } finally {
        setIsLoading(false);
      }
    },
    [query, initialData, toasts, addSuccessToast, addErrorToast, defaultErrorMessage]
  );

  const reset = useCallback(() => {
    setData(initialData);
    setIsLoading(false);
    setError(null);
  }, [initialData]);

  return {
    data,
    isLoading,
    error,
    fetch: executeQuery,
    reset,
  };
}
