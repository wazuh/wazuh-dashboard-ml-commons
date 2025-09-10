/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const isPermissionErrorLike = (err: any): boolean => {
  const status = err?.status ?? err?.statusCode ?? err?.response?.status;
  const body = String(err?.body || '').toLowerCase();
  const message = String(err?.message || '').toLowerCase();
  return (
    status === 403 ||
    message.includes('security_exception') ||
    message.includes('no permissions') ||
    body.includes('security_exception') ||
    body.includes('no permissions')
  );
};
