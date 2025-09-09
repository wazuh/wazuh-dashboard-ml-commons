export class PermissionMLConfigError extends Error {
  constructor() {
    super(
      'You don\'t have the necessary permissions to access the ML configuration. Please ensure your user has a role with index permissions for `.plugins-ml-config` and the "system:admin/system_index" action group under `Indexer Management » Security » Roles`. Assign the role to your user and try again.',
    );
    this.name = 'PermissionMLConfigError';
  }
}
