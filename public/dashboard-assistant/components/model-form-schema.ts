/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ModelFormData } from './types';
import { modelProviderConfigs } from '../provider-model-config';

// Get valid model providers from config
const validModelProviders = Object.keys(modelProviderConfigs);

// Browser-safe validation function (no @osd/config-schema)
export const validateModelForm = (data: ModelFormData): ValidationResult => {
  const errors: Array<{ field: keyof ModelFormData; message: string }> = [];

  // Provider validation
  if (!validModelProviders.includes(data.modelProvider)) {
    errors.push({
      field: 'modelProvider',
      message: `Provider must be one of: ${validModelProviders.join(', ')}`,
    });
  }

  // Model validation
  if (!data.model || data.model.trim().length < 1) {
    errors.push({
      field: 'model',
      message: 'Model is required and must be at least 1 character long',
    });
  }

  // API URL validation (http/https)
  if (!data.apiUrl || data.apiUrl.trim().length < 1) {
    errors.push({
      field: 'apiUrl',
      message: 'API URL must be a valid URL with http or https scheme',
    });
  } else {
    try {
      const url = new URL(data.apiUrl);
      if (!['http:', 'https:'].includes(url.protocol)) {
        errors.push({
          field: 'apiUrl',
          message: 'API URL must be a valid URL with http or https scheme',
        });
      }
    } catch {
      errors.push({
        field: 'apiUrl',
        message: 'API URL must be a valid URL with http or https scheme',
      });
    }
  }

  // API key validation
  if (!data.apiKey || data.apiKey.trim().length < 1) {
    errors.push({
      field: 'apiKey',
      message: 'API key is required and must be at least 1 character long',
    });
  }

  // Provider-specific checks
  const selectedProviderConfig = modelProviderConfigs[data.modelProvider];
  if (selectedProviderConfig) {
    if (!selectedProviderConfig.models.includes(data.model)) {
      errors.push({
        field: 'model',
        message: `Model "${data.model}" is not available for provider "${data.modelProvider}"`,
      });
    }

    if (selectedProviderConfig.default_endpoint_regex && data.apiUrl) {
      const regex = new RegExp(selectedProviderConfig.default_endpoint_regex);
      const fullUrl = data.apiUrl;
      if (!regex.test(fullUrl)) {
        errors.push({
          field: 'apiUrl',
          message: `API URL does not match the expected pattern for ${data.modelProvider}`,
        });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    value: errors.length === 0 ? data : null,
  };
};

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    field: keyof ModelFormData;
    message: string;
  }>;
  value: ModelFormData | null;
}
