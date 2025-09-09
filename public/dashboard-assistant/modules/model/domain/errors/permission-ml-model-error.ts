import { PermissionMLError } from "../../../common/domain/errors";

export class PermissionMLModelError extends PermissionMLError {
  constructor() {
    super('ML Model resources', '.plugins-ml-model');
    this.name = 'PermissionMLModelError';
  }
}