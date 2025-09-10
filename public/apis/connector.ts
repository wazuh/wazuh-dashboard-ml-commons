/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CONNECTOR_API_ENDPOINT,
  INTERNAL_CONNECTOR_API_ENDPOINT,
} from '../../server/routes/constants';
import { PermissionMLConnectorError } from '../dashboard-assistant/modules/connector/domain/errors';
import { isPermissionErrorLike } from '../utils/is-permission-error-like';
import { InnerHttpProvider } from './inner_http_provider';

export interface GetAllConnectorResponse {
  data: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
  total_connectors: number;
}

interface GetAllInternalConnectorResponse {
  data: string[];
}

export class Connector {
  public async getAll({
    dataSourceId,
  }: {
    dataSourceId?: string;
  }): Promise<GetAllConnectorResponse> {
    try {
      const response = await InnerHttpProvider.getHttp().get<GetAllConnectorResponse>(
        CONNECTOR_API_ENDPOINT,
        {
          query: {
            data_source_id: dataSourceId,
          },
        }
      );
      return response;
    } catch (error) {
      // If this is a permissions error against .plugins-ml-connector, abort with custom error.
      if (isPermissionErrorLike((error as any)?.body)) {
        throw new PermissionMLConnectorError();
      }
      return Promise.reject();
    }
  }

  public getAllInternal({ dataSourceId }: { dataSourceId?: string }) {
    return InnerHttpProvider.getHttp().get<GetAllInternalConnectorResponse>(
      INTERNAL_CONNECTOR_API_ENDPOINT,
      {
        query: {
          data_source_id: dataSourceId,
        },
      }
    );
  }
}
