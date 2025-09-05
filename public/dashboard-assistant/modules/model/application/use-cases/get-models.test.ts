/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { getModelsUseCase } from './get-models';
import { createModelRepositoryMock } from '../ports/__mocks__/model-repository';

describe('getModelsUseCase', () => {
  it('returns models from repository', async () => {
    const repo = createModelRepositoryMock();
    repo.getAll.mockResolvedValueOnce([{ id: 'a' }] as any);
    const useCase = getModelsUseCase(repo);
    await expect(useCase()).resolves.toEqual([{ id: 'a' }]);
  });
});
