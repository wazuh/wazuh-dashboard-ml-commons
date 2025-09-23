/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLink,
  EuiListGroup,
  EuiSpacer,
  EuiText,
  EuiTitle,
  EuiPopover,
  EuiCopy,
  EuiButtonEmpty,
} from '@elastic/eui';
import {
  InstallationProgress,
  ExecutionState,
  StepState,
} from '../modules/installation-manager/domain';
import { StepIcon } from './step-icon';
import { StepStatus } from './types';

interface DeploymentStatusProps {
  progress?: InstallationProgress;
  onDeploymentComplete?: () => void;
  onErrorDuringDeployment?: (error: string) => void;
  showCheckDeploymentButton?: boolean;
}

export const DeploymentStatus = ({
  progress,
  onDeploymentComplete,
  onErrorDuringDeployment,
  showCheckDeploymentButton = false,
}: DeploymentStatusProps) => {
  const [openErrorPopoverKey, setOpenErrorPopoverKey] = React.useState<string | null>(null);
  // Helper function to map installation states to UI states
  const mapToUIStatus = (executionState: ExecutionState): StepStatus => {
    if (executionState === ExecutionState.PENDING) {
      return StepStatus.PENDING;
    }
    if (executionState === ExecutionState.RUNNING) {
      return StepStatus.LOADING;
    }
    if (executionState === ExecutionState.FINISHED_SUCCESSFULLY) {
      return StepStatus.SUCCESS;
    }
    if (executionState === ExecutionState.FINISHED_WITH_WARNINGS) {
      return StepStatus.WARNING;
    }
    if (executionState === ExecutionState.FAILED) {
      return StepStatus.ERROR;
    }
    return StepStatus.PENDING;
  };

  const steps = progress?.getSteps() || [];

  return (
    <>
      <EuiTitle size="s">
        <h3>Assistant setup in progress</h3>
      </EuiTitle>

      <EuiSpacer size="s" />

      <EuiText size="s" color="subdued">
        Installing and configuring your intelligent dashboard assistant. Please wait while we set up
        the AI components and establish model connections to enable natural language interactions
        with your data.
      </EuiText>

      <EuiSpacer size="l" />

      <EuiListGroup flush maxWidth={false}>
        {steps.map((step: StepState, index) => {
          const uiStatus = step ? mapToUIStatus(step.state) : StepStatus.PENDING;
          const key = `${step.stepName}-${index}`;

          return (
            <div
              key={key}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
              }}
            >
              <EuiText size="s">{step.stepName}</EuiText>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {uiStatus === StepStatus.ERROR && step?.error ? (
                  <EuiPopover
                    panelStyle={{ wordBreak: 'break-word' }}
                    isOpen={openErrorPopoverKey === key}
                    closePopover={() => setOpenErrorPopoverKey(null)}
                    anchorPosition="rightCenter"
                    button={
                      <div
                        style={{ cursor: 'pointer' }}
                        onClick={() =>
                          setOpenErrorPopoverKey((current) => (current === key ? null : key))
                        }
                        aria-label="Show error details"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setOpenErrorPopoverKey((current) => (current === key ? null : key));
                          }
                        }}
                      >
                        <StepIcon status={uiStatus} />
                      </div>
                    }
                  >
                    <EuiText size="s">
                      <p style={{ maxWidth: 320 }}>{step.error.message}</p>
                    </EuiText>
                    <EuiSpacer size="s" />
                    <EuiCopy textToCopy={step.error.message}>
                      {(copy) => (
                        <EuiButtonEmpty size="s" iconType="copyClipboard" onClick={copy}>
                          Copy message
                        </EuiButtonEmpty>
                      )}
                    </EuiCopy>
                  </EuiPopover>
                ) : (
                  <StepIcon status={uiStatus} />
                )}
              </div>
            </div>
          );
        })}
      </EuiListGroup>
      {(() => {
        const hasItems = (arr: any[]) => arr && arr.length > 0;

        const hasErrors = () => {
          const failedSteps = progress?.getFailedSteps() || [];
          return progress && !progress.isFinished() && hasItems(failedSteps);
        };

        const handleProcessDeploymentClick = () => {
          if (hasErrors()) {
            const failedSteps = progress?.getFailedSteps() || [];
            const errorMessage = failedSteps
              .map((step) => step.error || 'Unknown error')
              .join(', ');
            onErrorDuringDeployment?.(errorMessage);
          } else {
            onDeploymentComplete?.();
          }
        };

        const buttonText = hasErrors() ? 'Try again' : 'Go to model assistants';

        const shouldShowButton = hasErrors() || showCheckDeploymentButton || progress?.isFinished();
        return (
          !!shouldShowButton && (
            <>
              <EuiSpacer size="l" />
              <EuiFlexGroup justifyContent="center">
                <EuiFlexItem grow={false}>
                  <EuiButton fill onClick={handleProcessDeploymentClick}>
                    {buttonText}
                  </EuiButton>
                </EuiFlexItem>
              </EuiFlexGroup>
            </>
          )
        );
      })()}
    </>
  );
};
