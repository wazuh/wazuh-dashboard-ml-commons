/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export abstract class PermissionMLError extends Error {
  constructor(config: string, indexPattern: string, indexPermissions: string[] = []) {
    indexPermissions ||= [];
    indexPermissions.push('system:admin/system_index');
    super(
      `You don't have the necessary permissions to access the ${config}. Please ensure your user has a role with index permissions for \`${indexPattern}\` and the "${indexPermissions.join(
        ', '
      )}" action group under \`Indexer Management » Security » Roles\`. Assign the role to your user and try again.`
    );
    this.name = 'PermissionMLError';
  }
}
