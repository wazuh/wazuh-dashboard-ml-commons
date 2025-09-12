/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { MLCommonsSettingsCreateFactory } from './ml-commons-settings-factory';

describe('MLCommonsSettingsCreateFactory', () => {
  it('maps CreateMLCommonsDto to plugin settings', () => {
    const res = MLCommonsSettingsCreateFactory.create({
      endpoints_regex: ['^https?://.*$'],
    });
    expect(res).toEqual({
      ml_commons: {
        agent_framework_enabled: true,
        only_run_on_ml_node: false,
        rag_pipeline_feature_enabled: true,
        trusted_connector_endpoints_regex: ['^https?://.*$'],
      },
    });
  });
});
