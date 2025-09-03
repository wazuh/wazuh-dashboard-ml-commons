import React, { useEffect, useState } from 'react';
import { EuiCodeBlock } from '@elastic/eui';
import { getUseCases } from '../services/ml-use-cases.service';

interface RegisterAgentClipboardProps {
  entityId: string;
  targetEntity: 'agent' | 'model';
}

const RegisterAgentCommand = ({
  entityId,
  targetEntity,
}: RegisterAgentClipboardProps) => {
  const [command, setCommand] = useState<string | null>(null);

  const fetchRegisterAgentCommand = async () => {
    let command = '';
    if (targetEntity === 'agent') {
      command = await getUseCases().getRegisterAgentCommand(entityId);
    } else {
      command = await getUseCases().getRegisterAgentCommandByModelId(entityId);
    }
    setCommand(command);
  };

  useEffect(() => {
    if (entityId) {
      fetchRegisterAgentCommand();
    }
  }, [entityId]);

  return (
    <EuiCodeBlock language='shell' isCopyable>
      {command}
    </EuiCodeBlock>
  );
};

export default RegisterAgentCommand;
