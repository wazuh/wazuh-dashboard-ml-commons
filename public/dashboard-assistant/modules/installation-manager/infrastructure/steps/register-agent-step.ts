import { getUseCases } from "../../../../services/ml-use-cases.service";
import {
  InstallationContext,
  InstallationAIAssistantStep,
  InstallAIDashboardAssistantDto,
} from '../../domain';

export class RegisterAgentStep extends InstallationAIAssistantStep {
  constructor() {
    super({ name: 'Register Agent' });
  }

  public async execute(
    request: InstallAIDashboardAssistantDto,
    context: InstallationContext,
  ): Promise<void> {
    const agentId = context.get<string>('agentId');
    await getUseCases().useAgent(agentId);
  }

  public getSuccessMessage(): string {
    return 'Agent registered successfully';
  }

  public getFailureMessage(): string {
    return 'Failed to register agent. Please check the configuration and try again.';
  }
}
