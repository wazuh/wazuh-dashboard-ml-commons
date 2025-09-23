/*
 * Copyright Wazuh Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ExecutionState, StepResultState } from '../enums';
import { InstallationAIAssistantStep } from './installation-ai-assistant-step';
import { InstallationProgress } from './installation-progress';
import type { InstallAIDashboardAssistantDto } from '../types/install-ai-dashboard-assistant-dto';
import type { InstallationContext } from './installation-context';

interface RollbackError {
  step: string;
  message: string;
}

interface RollbackAction {
  step: string;
}

export class InstallationProgressManager {
  private readonly progress: InstallationProgress;
  // Prevent concurrent executions
  private inProgress = false;
  private completedSteps: InstallationAIAssistantStep[] = [];
  private rollbackErrors: RollbackError[] = [];
  private rollbacks: RollbackAction[] = [];

  constructor(
    steps: InstallationAIAssistantStep[],
    private onProgressChange?: (progress: InstallationProgress) => void
  ) {
    if (steps.length === 0) {
      throw new Error('At least one step must be provided');
    }

    this.progress = new InstallationProgress({
      steps: steps.map((step) => ({
        stepName: step.getName(),
        state: ExecutionState.PENDING,
      })),
    });

    this.progress.subscribe(() => {
      this.notifyProgress();
    });
  }

  public getProgress(): InstallationProgress {
    // Return a cloned snapshot to avoid external mutations
    return this.progress.clone();
  }

  public async runStep(
    step: InstallationAIAssistantStep,
    request: InstallAIDashboardAssistantDto,
    context: InstallationContext,
    executor: () => Promise<void>
  ): Promise<void> {
    if (this.inProgress) {
      throw new Error('A step is already running');
    }
    const i = this.progress.getCurrentStep();
    if (!this.progress.isStepPositionValid(i) || this.progress.isFinished()) {
      throw new Error('All steps have been completed');
    }

    this.inProgress = true;
    this.progress.startStep(i);
    this.rollbackErrors = [];
    this.rollbacks = [];
    try {
      await executor();
      this.completedSteps.push(step);
      this.succeedStep(i, step);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      await this.rollbackSteps(step, request, context, error);
      this.failStep(i, step, error);
      throw error;
    } finally {
      this.inProgress = false;
    }
  }

  public getRollbackErrors(): RollbackError[] | undefined {
    return this.rollbackErrors.length > 0 ? [...this.rollbackErrors] : undefined;
  }

  public getRollbacks(): RollbackAction[] | undefined {
    return this.rollbacks.length > 0 ? [...this.rollbacks] : undefined;
  }

  private succeedStep(stepIndex: number, step: InstallationAIAssistantStep): void {
    this.progress.completeStep(stepIndex, StepResultState.SUCCESS, step.getSuccessMessage());
  }

  private failStep(stepIndex: number, step: InstallationAIAssistantStep, error: Error): void {
    this.progress.completeStep(stepIndex, StepResultState.FAIL, step.getFailureMessage(), error);
  }

  private notifyProgress(): void {
    if (this.onProgressChange) {
      this.onProgressChange(this.getProgress());
    }
  }

  private async rollbackSteps(
    failedStep: InstallationAIAssistantStep,
    request: InstallAIDashboardAssistantDto,
    context: InstallationContext,
    failure: Error
  ): Promise<void> {
    const stepsToRollback = [...this.completedSteps].reverse();

    await this.invokeRollback(failedStep, request, context, failure);
    for (const step of stepsToRollback) {
      await this.invokeRollback(step, request, context, failure);
    }

    this.completedSteps = [];
  }

  private async invokeRollback(
    step: InstallationAIAssistantStep,
    request: InstallAIDashboardAssistantDto,
    context: InstallationContext,
    failure: Error
  ): Promise<void> {
    try {
      await step.rollback(request, context, failure);
      this.rollbacks.push({ step: step.getName() });
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      this.rollbackErrors.push({ step: step.getName(), message: normalizedError.message });
    }
  }
}
