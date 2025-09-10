/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createGetterSetter } from '../../../../../src/plugins/opensearch_dashboards_utils/common';
import type { HttpClient } from '../modules/common/http/domain/entities/http-client';

export const [getHttpClient, setHttpClient] = createGetterSetter<HttpClient>('HttpClient');
export const [getProxyHttpClient, setProxyHttpClient] = createGetterSetter<HttpClient>(
  'ProxyHttpClient'
);
