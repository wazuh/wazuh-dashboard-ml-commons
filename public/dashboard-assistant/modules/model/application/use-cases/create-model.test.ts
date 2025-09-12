/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createModelUseCase } from './create-model';
import { createModelRepositoryMock } from '../ports/__mocks__/model-repository';

describe('createModelUseCase', () => {
  it('delegates to repository.create', async () => {
    const repo = createModelRepositoryMock();
    repo.create.mockResolvedValueOnce({ id: '1' } as any);
    const useCase = createModelUseCase(repo);
    const res = await useCase({
      name: 'n',
      connector_id: 'c',
      description: 'd',
    });
    expect(repo.create).toHaveBeenCalled();
    expect(res).toEqual({ id: '1' });
  });
});
