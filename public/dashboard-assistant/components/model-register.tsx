/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  EuiButton,
  EuiButtonEmpty,
  EuiTitle,
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiPanel,
  EuiFlyout,
  EuiFlyoutHeader,
  EuiFlyoutBody,
} from '@elastic/eui';
import { ModelForm } from '.';
import { DeploymentStatus } from '.';
import { ProviderModelConfig } from '../provider-model-config';
import { useAssistantInstallation } from '../modules/installation-manager/hooks/use-assistant-installation';
import { ModelFormData } from './types';
import { useToast } from '../hooks/use-toast';

interface FormConfig {
  title: string;
  description: string;
  buttons: {
    cancel: string;
    deploy: string;
  };
  maxWidth: string;
  padding: string;
}

interface ModelRegisterProps {
  disabled?: boolean;
  modelConfig?: ProviderModelConfig[];
  formConfig?: FormConfig;
  onCancel?: () => void;
  onDeployed?: () => void;
}

const ModelRegisterComponent = ({
  disabled = false,
  formConfig,
  onCancel,
  onDeployed,
}: ModelRegisterProps) => {
  const [isDeployed, setIsDeployed] = useState(false);
  const { addSuccessToast, addErrorToast, addInfoToast } = useToast();
  const {
    install: startInstallationProcess,
    setModel,
    isLoading: isInstalling,
    error: installationError,
    progress: installationProgress,
    isSuccess: isInstallationSuccessful,
    result: installationResult,
  } = useAssistantInstallation();
  const lastRollbackKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (installationError) {
      addErrorToast(
        `Error deploying model`,
        `${installationError}. Rolling back current installation. Please, verify data provided and try again.`
      );
    }
  }, [addErrorToast, installationError]);

  useEffect(() => {
    if (installationError && installationResult?.rollbacks?.length) {
      const rollbackSummary = installationResult.rollbacks.join(', ');
      if (lastRollbackKeyRef.current !== rollbackSummary) {
        addInfoToast('Rollback summary', `Reverted steps: ${rollbackSummary}`);
        lastRollbackKeyRef.current = rollbackSummary;
      }
    } else if (!installationError) {
      lastRollbackKeyRef.current = null;
    }
  }, [addInfoToast, installationError, installationResult]);

  useEffect(() => {
    if (isInstallationSuccessful) {
      addSuccessToast('Model deployed successfully.');
    }
  }, [addSuccessToast, isInstallationSuccessful]);

  // Default form configuration
  const defaultFormConfig: FormConfig = {
    title: 'Register your preferred AI model',
    description:
      "Select and configure the AI model that will power your dashboard assistant's conversational capabilities and data insights",
    buttons: {
      cancel: 'Cancel',
      deploy: 'Deploy',
    },
    maxWidth: '600px',
    padding: '24px',
  };

  const config = formConfig || defaultFormConfig;

  const [isFormValid, setIsFormValid] = useState(false);
  const [isDeploymentVisible, setIsDeploymentVisible] = useState(false);

  const handleFormChange = useCallback(
    (data: ModelFormData) => {
      setModel({
        model_provider: data.modelProvider,
        model_id: data.model,
        api_url: data.apiUrl,
        api_key: data.apiKey,
        description: `${data.modelProvider} ${data.model} model`,
      });
    },
    [setModel]
  );

  const handleValidationChange = useCallback((isValid: boolean) => {
    setIsFormValid(isValid);
  }, []);

  const startModelDeployment = async () => {
    setIsDeploymentVisible(true);
    // Execute the installation using the hook
    await startInstallationProcess();

    setIsDeployed(true);
  };

  return (
    <>
      <EuiFlexGroup
        direction="column"
        justifyContent="center"
        alignItems="center"
        gutterSize="none"
        style={{ width: '100%' }}
        className="model-register-form"
      >
        <EuiFlexItem grow={false} style={{ maxWidth: config.maxWidth || '600px', width: '100%' }}>
          <EuiPanel paddingSize="l">
            <EuiTitle size="l">
              <h2>{config.title}</h2>
            </EuiTitle>

            <EuiSpacer size="s" />

            <EuiText color="subdued">
              <p>{config.description}</p>
            </EuiText>

            <EuiSpacer size="l" />

            <ModelForm
              onChange={handleFormChange}
              onValidationChange={handleValidationChange}
              disabled={disabled}
            />

            <EuiSpacer size="xl" />

            <EuiFlexGroup justifyContent="flexEnd" gutterSize="m">
              <EuiFlexItem grow={false}>
                <EuiButtonEmpty onClick={onCancel} disabled={isInstalling || isDeployed}>
                  {config.buttons.cancel}
                </EuiButtonEmpty>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButton
                  fill
                  onClick={startModelDeployment}
                  disabled={!isFormValid || isInstalling || isDeployed}
                  isLoading={isInstalling}
                >
                  {isInstalling ? 'Deploying...' : config.buttons.deploy}
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiPanel>
        </EuiFlexItem>
      </EuiFlexGroup>

      {isDeploymentVisible && (
        <EuiFlyout onClose={onCancel} size="s" type="push">
          <EuiFlyoutHeader hasBorder>
            <EuiTitle size="m">
              <h2>Model deployment</h2>
            </EuiTitle>
          </EuiFlyoutHeader>

          <EuiFlyoutBody>
            <DeploymentStatus
              progress={installationProgress}
              onDeploymentComplete={onDeployed}
              showCheckDeploymentButton={isInstallationSuccessful}
              onErrorDuringDeployment={() => {
                setIsDeployed(false);
                setIsDeploymentVisible(false);
              }}
            />
          </EuiFlyoutBody>
        </EuiFlyout>
      )}
    </>
  );
};

export const ModelRegister = ModelRegisterComponent;
