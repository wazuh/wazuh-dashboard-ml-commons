/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EuiPanel,
  EuiSpacer,
  EuiTextColor,
  EuiFlexGroup,
  EuiFlexItem,
  EuiText,
  EuiFilterGroup,
  EuiButtonEmpty,
  EuiEmptyPrompt,
} from '@elastic/eui';
import React, { useState, useRef, useCallback } from 'react';
import { FormattedMessage } from '@osd/i18n/react';

import { EuiFlyout, EuiFlyoutHeader, EuiFlyoutBody, EuiTitle } from '@elastic/eui';
import { Link } from 'react-router-dom';
import { ModelDeploymentProfile } from '../../apis/profile';
import { PreviewPanel } from '../preview_panel';
import { ApplicationStart, ChromeStart } from '../../../../../src/core/public';
import { NavigationPublicPluginStart } from '../../../../../src/plugins/navigation/public';

import { ModelDeploymentItem, ModelDeploymentTable } from './model_deployment_table';
import { useMonitoring } from './use_monitoring';
import { ModelStatusFilter } from './model_status_filter';
import { SearchBar } from './search_bar';
import { ModelSourceFilter } from './model_source_filter';
import { ModelConnectorFilter } from './model_connector_filter';
import { MonitoringPageHeader } from './monitoring_page_header';
import { useModelTest } from '../../dashboard-assistant/modules/model/hooks';
import { useModel } from '../../dashboard-assistant/modules/model/hooks';
import { DeleteModelModal } from '../delete_model_modal';
import { ModelTestResult } from '../../dashboard-assistant/components/model-test-result';
import { useFlyout } from '../../dashboard-assistant/hooks/use-flyout';
import { routerPaths } from '../../../common/router_paths';

interface MonitoringProps {
  chrome: ChromeStart;
  navigation: NavigationPublicPluginStart;
  application: ApplicationStart;
  useNewPageHeader: boolean;
}

export const Monitoring = (props: MonitoringProps) => {
  const { useNewPageHeader, chrome, application, navigation } = props;
  const {
    pageStatus,
    params,
    pagination,
    deployedModels,
    handleTableChange,
    resetSearch,
    searchByNameOrId,
    reload,
    searchByStatus,
    searchBySource,
    searchByConnector,
    allExternalConnectors,
    permissionErrorMessage,
  } = useMonitoring();

  const [preview, setPreview] = useState<{
    model: ModelDeploymentItem;
    dataSourceId: string | undefined;
  } | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelDeploymentItem | null>(null);
  const {
    isLoading: isTestLoading,
    response: testResponse,
    error: testError,
    testModel,
    reset: resetTest,
  } = useModelTest();
  const { isOpen: isTestFlyoutOpen, open: openTestFlyout, close: closeTestFlyout } = useFlyout({
    async onOpenHandler(model: ModelDeploymentItem) {
      setSelectedModel(model);
      await testModel(model.id);
    },
    onCloseHandler() {
      setSelectedModel(null);
    },
    resetHandler() {
      resetTest();
    },
  });
  const searchInputRef = useRef<HTMLInputElement | null>();

  const setInputRef = useCallback((node: HTMLInputElement | null) => {
    searchInputRef.current = node;
  }, []);

  const onResetSearch = useCallback(() => {
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
    resetSearch();
  }, [resetSearch]);

  const handleViewDetail = useCallback(
    (modelPreviewItem: ModelDeploymentItem) => {
      // This check is for type safe, the data source id won't be invalid or fetching if model can be previewed.
      if (typeof params.dataSourceId !== 'symbol') {
        setPreview({
          model: modelPreviewItem,
          dataSourceId: params.dataSourceId,
        });
      }
    },
    [params.dataSourceId]
  );

  const onCloseModelPreview = useCallback(
    (modelProfile: ModelDeploymentProfile | null) => {
      if (
        modelProfile !== null &&
        (preview?.model?.planningNodesCount !== modelProfile.target_worker_nodes?.length ||
          preview?.model?.respondingNodesCount !== modelProfile.worker_nodes?.length)
      ) {
        reload();
      }
      setPreview(null);
    },
    [preview, reload]
  );

  const { activateModel } = useModel({ onSuccess: reload });
  const handleUseModel = useCallback(
    async (model: ModelDeploymentItem) => {
      if (!model.agentId) return;
      await activateModel(model.agentId);
    },
    [activateModel]
  );

  const [modelToDelete, setModelToDelete] = useState<ModelDeploymentItem | null>(null);

  const openDeleteModal = useCallback((model: ModelDeploymentItem) => {
    setModelToDelete(model);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setModelToDelete(null);
  }, []);

  const handleDeleteModel = useCallback(
    async (model: ModelDeploymentItem) => {
      openDeleteModal(model);
    },
    [openDeleteModal]
  );

  return (
    <>
      <MonitoringPageHeader
        onRefresh={reload}
        navigation={navigation}
        setBreadcrumbs={chrome.setBreadcrumbs}
        recordsCount={pagination?.totalRecords}
        application={application}
        useNewPageHeader={useNewPageHeader}
        showRefreshInterval={!permissionErrorMessage}
      />
      <EuiPanel>
        {!useNewPageHeader && (
          <>
            <EuiFlexGroup justifyContent="spaceBetween" alignItems="center" gutterSize="none">
              <EuiFlexItem>
                <EuiText size="s">
                  <h2>
                    <FormattedMessage
                      id="machineLearning.aiModels.table.header.title"
                      defaultMessage="Models {records}"
                      values={{
                        records:
                          pageStatus === 'normal' ? (
                            <EuiTextColor aria-label="total number of results" color="subdued">
                              ({pagination?.totalRecords ?? 0})
                            </EuiTextColor>
                          ) : undefined,
                      }}
                    />
                  </h2>
                </EuiText>
              </EuiFlexItem>

              <EuiFlexItem>
                <EuiFlexGroup justifyContent="flexEnd" gutterSize="none">
                  {!permissionErrorMessage && (
                    <EuiFlexItem key="add-model" grow={false}>
                      <Link to={routerPaths.registerModel}>
                        <EuiButtonEmpty color="primary" iconType="plusInCircle">
                          Add model
                        </EuiButtonEmpty>
                      </Link>
                    </EuiFlexItem>
                  )}
                  <EuiFlexItem key="refresh" grow={false}>
                    <EuiButtonEmpty iconType="refresh" onClick={reload}>
                      Refresh
                    </EuiButtonEmpty>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
            </EuiFlexGroup>
            <EuiSpacer size="m" />
          </>
        )}
        {!permissionErrorMessage && pageStatus !== 'empty' && (
          <>
            <EuiFlexGroup gutterSize={useNewPageHeader ? 's' : 'l'}>
              <EuiFlexItem>
                <SearchBar inputRef={setInputRef} onSearch={searchByNameOrId} />
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiFilterGroup>
                  <ModelSourceFilter value={params.source} onChange={searchBySource} />
                  <ModelConnectorFilter
                    value={params.connector}
                    onChange={searchByConnector}
                    allExternalConnectors={allExternalConnectors}
                    dataSourceId={params.dataSourceId}
                  />
                  <ModelStatusFilter selection={params.status} onChange={searchByStatus} />
                </EuiFilterGroup>
              </EuiFlexItem>
            </EuiFlexGroup>
            <EuiSpacer size="m" />
          </>
        )}
        {permissionErrorMessage ? (
          <EuiEmptyPrompt
            iconColor="danger"
            iconType="alert"
            title={<EuiText size="m">Insufficient permissions to view AI models.</EuiText>}
            body={<EuiText size="s">{permissionErrorMessage}</EuiText>}
          />
        ) : (
          <ModelDeploymentTable
            noTable={pageStatus === 'empty'}
            loading={pageStatus === 'loading'}
            items={deployedModels}
            sort={params.sort}
            pagination={pagination}
            onChange={handleTableChange}
            onViewDetail={handleViewDetail}
            onResetSearchClick={onResetSearch}
            onUseModel={handleUseModel}
            onTestModel={openTestFlyout}
            onDeleteModel={handleDeleteModel}
          />
        )}
        {modelToDelete && (
          <DeleteModelModal model={modelToDelete} onClose={closeDeleteModal} onDeleted={reload} />
        )}
        {preview && (
          <PreviewPanel
            model={preview.model}
            onClose={onCloseModelPreview}
            dataSourceId={preview.dataSourceId}
          />
        )}
        {isTestFlyoutOpen && selectedModel && (
          <EuiFlyout onClose={closeTestFlyout} size="s">
            <EuiFlyoutHeader hasBorder>
              <EuiTitle size="m">
                <h2>Test Model: {selectedModel.name}</h2>
              </EuiTitle>
            </EuiFlyoutHeader>
            <EuiFlyoutBody>
              <ModelTestResult
                isLoading={isTestLoading}
                response={testResponse}
                error={testError}
                modelName={selectedModel.name}
              />
            </EuiFlyoutBody>
          </EuiFlyout>
        )}
      </EuiPanel>
    </>
  );
};
