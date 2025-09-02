import React from 'react';
import { EuiPanel, EuiGlobalToastList } from '@elastic/eui';
import { ModelsTable } from './components';
import { ToastProvider, useToast } from './hooks/use-toast';
import NavigationService from '../../../main/public/react-services/navigation-service';
import { withGlobalBreadcrumb } from '../../../main/public/components/common/hocs';

const toastConfig = {
  lifeTimeMs: 6000,
};

const AssistantOverviewContent = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div style={{ padding: '24px' }}>
      <EuiPanel>
        <ModelsTable onAddModel />
      </EuiPanel>
      <EuiGlobalToastList
        toasts={toasts}
        dismissToast={removeToast}
        toastLifeTimeMs={toastConfig.lifeTimeMs}
      />
    </div>
  );
};

export const AssistantOverview = withGlobalBreadcrumb([
  {
    text: 'Dashboard Assistant',
  },
])(() => {
  return (
    <ToastProvider>
      <AssistantOverviewContent />
    </ToastProvider>
  );
});
