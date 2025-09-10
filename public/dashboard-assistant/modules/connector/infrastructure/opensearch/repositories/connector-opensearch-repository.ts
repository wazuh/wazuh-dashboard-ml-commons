/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpClient } from '../../../../common/http/domain/entities/http-client';
import { OpenSearchResponseDto } from '../../../../common/infrastructure/opensearch/dtos/opensearch-response-dto';
import { CreateConnectorDto } from '../../../application/dtos/create-connector-dto';
import { ConnectorOpenSearchCreateFactory } from '../factories/connector-opensearch-create-factory';
import { ConnectorRepository } from '../../../application/ports/connector-repository';
import { Connector } from '../../../domain/entities/connector';
import { ConnectorOpenSearchResponseCreateDto } from '../dtos/connector-opensearch-response-create-dto';
import { ConnectorOpenSearchMapper } from '../mapper/connector-opensearch-mapper';
import { ConnectorOpenSearchResponseDto } from '../dtos/connector-opensearch-response-dto';

export class ConnectorOpenSearchRepository implements ConnectorRepository {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly proxyHttpClient: HttpClient
  ) {}

  public async create(connectorDto: CreateConnectorDto): Promise<Connector> {
    const connectorOpensearchCreateDto = ConnectorOpenSearchCreateFactory.create(connectorDto);
    const response = await this.proxyHttpClient.post<ConnectorOpenSearchResponseCreateDto>(
      '/_plugins/_ml/connectors/_create',
      connectorOpensearchCreateDto
    );
    return ConnectorOpenSearchMapper.fromRequest(
      response.connector_id,
      connectorOpensearchCreateDto
    );
  }

  public async delete(id: string): Promise<void> {
    await this.proxyHttpClient.delete(`/_plugins/_ml/connectors/${id}`);
  }

  public async getAll(): Promise<Connector[]> {
    const searchPayload = {
      query: { match_all: {} },
      size: 25,
    };

    const response = await this.proxyHttpClient.post<
      OpenSearchResponseDto<ConnectorOpenSearchResponseDto>
    >('/_plugins/_ml/connectors/_search', searchPayload);

    return response.hits.hits.map((hit) =>
      ConnectorOpenSearchMapper.fromResponse(hit._id, hit._source)
    );
  }
}
