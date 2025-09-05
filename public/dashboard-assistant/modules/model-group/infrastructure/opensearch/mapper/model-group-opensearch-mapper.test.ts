/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ModelGroupOpenSearchMapper } from './model-group-opensearch-mapper';

describe('ModelGroupOpenSearchMapper', () => {
  it('maps raw fields to ModelGroup entity', () => {
    const model = ModelGroupOpenSearchMapper.toModel({
      id: 'g1',
      name: 'Group',
      description: 'Desc',
    });
    expect(model).toEqual({ id: 'g1', name: 'Group', description: 'Desc' });
  });
});
