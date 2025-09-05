/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiIcon, EuiText, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { ModelStatus } from '../modules/model/domain/enums/model-status';

interface StatusIconProps {
  status: ModelStatus;
}

const statusColorMap: Record<ModelStatus, string> = {
  [ModelStatus.ACTIVE]: 'success',
  [ModelStatus.INACTIVE]: 'subdued',
  [ModelStatus.ERROR]: 'danger',
};

const AgentStatus = ({ status }: StatusIconProps) => {
  const color = statusColorMap[status] ?? 'subdued';
  const label = statusColorMap[status] ? status : 'Unknown';

  return (
    <EuiFlexGroup alignItems="center" gutterSize="none" responsive={false}>
      <EuiFlexItem grow={false}>
        <EuiIcon type="dot" color={color} />
      </EuiFlexItem>
      <EuiFlexItem>
        <EuiText size="s" style={{ marginLeft: 4 }}>
          {label}
        </EuiText>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};

export { AgentStatus };
