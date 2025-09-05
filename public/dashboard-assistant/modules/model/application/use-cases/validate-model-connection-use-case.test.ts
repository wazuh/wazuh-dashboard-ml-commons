/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { validateModelConnectionUseCase } from './validate-model-connection-use-case';
import { createModelRepositoryMock } from '../ports/__mocks__/model-repository';

describe('validateModelConnectionUseCase', () => {
  it('calls repository.validateConnection', async () => {
    const repo = createModelRepositoryMock();
    const payload: any = { ok: true };
    repo.validateConnection.mockResolvedValueOnce(payload);
    const useCase = validateModelConnectionUseCase(repo);
    await expect(useCase('mid')).resolves.toBe(payload);
    expect(repo.validateConnection).toHaveBeenCalledWith('mid');
  });
});
