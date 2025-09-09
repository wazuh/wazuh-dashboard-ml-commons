import { PermissionMLError } from "../../../common/domain/errors";

export class PermissionMLConnectorError extends PermissionMLError {
  constructor() {
    super('ML Connector resources', '.plugins-ml-connector');
    this.name = 'PermissionMLConnectorError';
  }
}