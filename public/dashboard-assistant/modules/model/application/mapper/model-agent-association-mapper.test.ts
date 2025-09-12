/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ModelAgentAssociationMapper } from './model-agent-association-mapper';
import { ModelStatus } from '../../domain/enums/model-status';

describe('ModelAgentAssociationMapper', () => {
  it('combines models with agents and flags inUse/status', () => {
    const models: any[] = [
      [
        {
          id: 'm1',
          name: 'A',
          version: '1',
          status: ModelStatus.ACTIVE,
          created_at: 'now',
        },
        { id: 'a1', name: 'Agent 1' },
      ],
      [
        {
          id: 'm2',
          name: 'B',
          version: '1',
          status: ModelStatus.ACTIVE,
          created_at: 'now',
        },
        null,
      ],
    ];
    const table = ModelAgentAssociationMapper.toTableData(models as any, 'a1');
    expect(table).toEqual([
      {
        name: 'A',
        id: 'm1',
        version: '1',
        status: ModelStatus.ACTIVE,
        createdAt: 'now',
        agentId: 'a1',
        agentName: 'Agent 1',
        inUse: true,
      },
      {
        name: 'B',
        id: 'm2',
        version: '1',
        status: ModelStatus.INACTIVE,
        createdAt: 'now',
        agentId: undefined,
        agentName: undefined,
        inUse: false,
      },
    ]);
  });
});
