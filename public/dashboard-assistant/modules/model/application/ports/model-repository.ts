/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CreateRepository,
  DeleteRepository,
  FindRepository,
  GetAllRepository,
} from '../../../common/domain/entities/repository';
import { Model } from '../../domain/entities/model';
import { ModelPredictResponse } from '../../domain/types';
import { CreateModelDto } from '../dtos/create-model-dto';

export interface ModelRepository
  extends CreateRepository<Model, CreateModelDto>,
    GetAllRepository<Model>,
    DeleteRepository,
    FindRepository<Model> {
  validateConnection(modelId: string): Promise<ModelPredictResponse>;
  deploy(modelId: string, deploy: boolean): Promise<void>;
}
