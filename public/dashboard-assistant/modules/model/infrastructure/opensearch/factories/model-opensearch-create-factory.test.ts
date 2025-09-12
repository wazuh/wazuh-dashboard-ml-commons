/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ModelOpenSearchCreateFactory } from './model-opensearch-create-factory';

describe('ModelOpenSearchCreateFactory', () => {
  it('creates request without model_group_id when absent', () => {
    const dto = ModelOpenSearchCreateFactory.create({
      name: 'm',
      connector_id: 'c',
      description: 'd',
    });
    expect(dto).toEqual({
      name: 'm',
      connector_id: 'c',
      description: 'd',
      function_name: 'remote',
    });
  });

  it('includes model_group_id when provided', () => {
    const dto = ModelOpenSearchCreateFactory.create({
      name: 'm',
      connector_id: 'c',
      description: 'd',
      model_group_id: 'g',
    });
    expect(dto).toEqual({
      name: 'm',
      connector_id: 'c',
      description: 'd',
      function_name: 'remote',
      model_group_id: 'g',
    });
  });
});
