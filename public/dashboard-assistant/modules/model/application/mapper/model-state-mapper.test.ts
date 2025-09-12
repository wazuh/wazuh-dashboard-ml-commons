/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ModelStateMapper } from './model-state-mapper';
import { ModelStatus } from '../../domain/enums/model-status';

describe('ModelStateMapper', () => {
  it('maps deployed/loaded to ACTIVE', () => {
    expect(ModelStateMapper.toStatus('DEPLOYED')).toBe(ModelStatus.ACTIVE);
    expect(ModelStateMapper.toStatus('loaded')).toBe(ModelStatus.ACTIVE);
  });
  it('maps undeployed/not_deployed to INACTIVE', () => {
    expect(ModelStateMapper.toStatus('UNDEPLOYED')).toBe(ModelStatus.INACTIVE);
    expect(ModelStateMapper.toStatus('not_deployed')).toBe(ModelStatus.INACTIVE);
  });
  it('maps failures to ERROR', () => {
    expect(ModelStateMapper.toStatus('DEPLOY_FAILED')).toBe(ModelStatus.ERROR);
    expect(ModelStateMapper.toStatus('load_failed')).toBe(ModelStatus.ERROR);
  });
  it('returns default for unknown', () => {
    expect(ModelStateMapper.toStatus('??', ModelStatus.INACTIVE)).toBe(ModelStatus.INACTIVE);
  });
});
