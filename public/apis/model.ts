/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { MODEL_API_ENDPOINT } from '../../server/routes/constants';
import { MODEL_STATE, ModelSearchSort } from '../../common';
import { InnerHttpProvider } from './inner_http_provider';
import { isPermissionErrorLike } from '../utils/is-permission-error-like';
import { PermissionMLModelError } from '../dashboard-assistant/modules/model/domain/errors';

export interface ModelSearchItem {
  id: string;
  name: string;
  algorithm: string;
  model_state: string;
  model_version: string;
  current_worker_node_count: number;
  planning_worker_node_count: number;
  planning_worker_nodes: string[];
  connector_id?: string;
  connector?: {
    name: string;
    description?: string;
  };
}

export interface ModelSearchResponse {
  data: ModelSearchItem[];
  total_models: number;
}

export class Model {
  public async search(query: {
    sort?: ModelSearchSort[];
    from: number;
    size: number;
    states?: MODEL_STATE[];
    nameOrId?: string;
    extraQuery?: Record<string, any>;
    dataSourceId?: string;
  }): Promise<ModelSearchResponse> {
    const { extraQuery, dataSourceId, ...restQuery } = query;
    try {
      const response = await InnerHttpProvider.getHttp().get<ModelSearchResponse>(
        MODEL_API_ENDPOINT,
        {
          query: extraQuery
            ? {
                ...restQuery,
                extra_query: JSON.stringify(extraQuery),
                data_source_id: dataSourceId,
              }
            : { ...restQuery, data_source_id: dataSourceId },
        }
      );
      return response;
    } catch (error) {
      // If this is a permissions error against .plugins-ml-model, abort with tagged error.
      if (isPermissionErrorLike((error as any)?.body)) {
        throw new PermissionMLModelError();
      }
      throw Promise.reject();
    }
  }
}
