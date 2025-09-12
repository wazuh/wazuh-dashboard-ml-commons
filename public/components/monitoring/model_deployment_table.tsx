/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import './index.scss';

import React, { useCallback, useMemo } from 'react';
import {
  Criteria,
  Direction,
  EuiBasicTable,
  EuiButton,
  EuiSmallButtonIcon,
  EuiEmptyPrompt,
  EuiHealth,
  EuiSpacer,
  EuiLink,
  EuiCopy,
  EuiText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
} from '@elastic/eui';

import { MODEL_STATE } from '../../../common';
import { LONGDASH } from '../../constants';
import type { ModelStatus } from '../../dashboard-assistant/modules/model/domain/enums/model-status';
import { AgentStatus } from '../../dashboard-assistant/components/agent-status';

export interface ModelDeploymentTableSort {
  field: 'name' | 'model_state' | 'id';
  direction: Direction;
}

export interface ModelDeploymentTableCriteria {
  pagination?: { currentPage: number; pageSize: number };
  sort?: ModelDeploymentTableSort;
}

export interface ModelDeploymentItem {
  id: string;
  name: string;
  model_state?: MODEL_STATE;
  respondingNodesCount: number | undefined;
  planningNodesCount: number | undefined;
  notRespondingNodesCount: number | undefined;
  planningWorkerNodes: string[];
  version?: string;
  agentId?: string;
  agent_state?: ModelStatus;
  inUse?: boolean;
  createdAt?: string;
  connector?: {
    id?: string;
    name?: string;
    description?: string;
  };
}

export interface ModelDeploymentTableProps {
  items: ModelDeploymentItem[];
  loading?: boolean;
  noTable?: boolean;
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalRecords: number | undefined;
  };
  sort: ModelDeploymentTableSort;
  onChange: (criteria: ModelDeploymentTableCriteria) => void;
  onViewDetail?: (modelDeploymentItem: ModelDeploymentItem) => void;
  onResetSearchClick?: () => void;
  onUseModel?: (modelDeploymentItem: ModelDeploymentItem) => void;
  onTestModel?: (modelDeploymentItem: ModelDeploymentItem) => void;
  onDeleteModel?: (modelDeploymentItem: ModelDeploymentItem) => void;
}

export const ModelDeploymentTable = ({
  sort,
  items,
  loading,
  noTable,
  pagination: paginationInProps,
  onChange,
  onViewDetail,
  onResetSearchClick,
  onUseModel,
  onTestModel,
  onDeleteModel,
}: ModelDeploymentTableProps) => {
  const columns = useMemo(
    () => [
      {
        field: 'name',
        name: 'Name',
        width: '26.13%',
        sortable: true,
        truncateText: true,
      },
      {
        field: 'agentId',
        name: 'Agent ID',
        width: '18%',
        truncateText: true,
        render: (agentId: string | undefined) => (
          <>
            <EuiCopy
              textToCopy={agentId}
              beforeMessage="Copy agent ID"
              anchorClassName="ml-modelModelIdCell"
            >
              {(copy) => (
                <EuiSmallButtonIcon
                  aria-label="Copy ID to clipboard"
                  color="text"
                  iconType="copy"
                  onClick={copy}
                />
              )}
            </EuiCopy>
            <EuiText className="eui-textTruncate ml-modelModelIdText" size="s">
              {agentId}
            </EuiText>
          </>
        ),
      },
      {
        field: 'id',
        name: 'Source',
        width: '14%',
        sortable: false,
        truncateText: true,
        render: (_id: string, modelDeploymentItem: ModelDeploymentItem) => {
          return modelDeploymentItem.connector ? 'External' : 'Local';
        },
      },
      {
        field: 'id',
        name: 'Connector name',
        width: '22%',
        truncateText: true,
        textOnly: true,
        render: (_id: string, modelDeploymentItem: ModelDeploymentItem) => {
          return modelDeploymentItem.connector?.name || LONGDASH;
        },
      },
      {
        field: 'model_state',
        name: 'Model Status',
        width: '14%',
        sortable: true,
        truncateText: true,
        render: (
          _model_state: string,
          { planningNodesCount, respondingNodesCount, notRespondingNodesCount }: ModelDeploymentItem
        ) => {
          if (
            planningNodesCount === undefined ||
            respondingNodesCount === undefined ||
            notRespondingNodesCount === undefined
          ) {
            return LONGDASH;
          }
          if (respondingNodesCount === 0) {
            return (
              <EuiHealth className="ml-modelStatusCell" color="danger">
                <div className="eui-textTruncate">Not responding</div>
              </EuiHealth>
            );
          }
          if (notRespondingNodesCount === 0) {
            return (
              <EuiHealth className="ml-modelStatusCell" color="success">
                <div className="eui-textTruncate">Responding</div>
              </EuiHealth>
            );
          }
          return (
            <EuiHealth className="ml-modelStatusCell" color="warning">
              <div className="eui-textTruncate">Partially responding</div>
            </EuiHealth>
          );
        },
      },
      {
        field: 'agent_state',
        name: 'Agent Status',
        width: '14%',
        truncateText: true,
        render: (status: ModelStatus) => <AgentStatus status={status} />,
      },
      {
        field: 'id',
        name: 'Model ID',
        width: '18%',
        sortable: true,
        render: (id: string) => (
          <>
            <EuiCopy
              className="ml-modelModelIdCellTextWrapper"
              textToCopy={id}
              beforeMessage="Copy model ID"
              anchorClassName="ml-modelModelIdCell"
            >
              {(copy) => (
                <EuiSmallButtonIcon
                  aria-label="Copy ID to clipboard"
                  color="text"
                  iconType="copy"
                  onClick={copy}
                />
              )}
            </EuiCopy>
            <EuiText className="eui-textTruncate ml-modelModelIdText" size="s">
              {id}
            </EuiText>
          </>
        ),
      },
      {
        field: 'inUse',
        name: 'In use',
        width: '10%',
        render: (inUse: boolean | undefined) =>
          inUse ? (
            <EuiFlexGroup alignItems="center" gutterSize="s" responsive={false}>
              <EuiFlexItem grow={false}>
                <EuiIcon type={'check'} color={'success'} size="m" />
              </EuiFlexItem>
            </EuiFlexGroup>
          ) : (
            LONGDASH
          ),
      },
      {
        name: 'Actions',
        align: 'right' as const,
        width: '12%',
        actions: [
          {
            name: 'Use model',
            description: 'Use model',
            icon: 'plusInCircle',
            onClick: (item: ModelDeploymentItem) => onUseModel?.(item),
            enabled: (item: ModelDeploymentItem) => !!item.agentId && !item.inUse,
          },
          {
            name: 'View status details',
            description: 'View status details',
            icon: 'inspect',
            onClick: (item: ModelDeploymentItem) => onViewDetail?.(item),
          },
          {
            name: 'Test model connection',
            description: 'Test model connection',
            icon: 'play',
            onClick: (item: ModelDeploymentItem) => onTestModel?.(item),
          },
          {
            name: 'Delete model',
            description: 'Delete model',
            icon: 'trash',
            color: 'danger',
            onClick: (item: ModelDeploymentItem) => onDeleteModel?.(item),
          },
        ],
      },
    ],
    [onViewDetail, onUseModel, onTestModel, onDeleteModel]
  );
  const sorting = useMemo(() => ({ sort }), [sort]);

  const pagination = useMemo(
    () =>
      paginationInProps
        ? {
            pageIndex: paginationInProps.currentPage - 1,
            pageSize: paginationInProps.pageSize,
            totalItemCount: paginationInProps.totalRecords || 0,
            pageSizeOptions: [10, 20, 50],
            showPerPageOptions: true,
          }
        : undefined,
    [paginationInProps]
  );

  const handleChange = useCallback(
    (criteria: Criteria<ModelDeploymentItem>) => {
      onChange({
        ...(criteria.page
          ? {
              pagination: {
                currentPage: criteria.page.index + 1,
                pageSize: criteria.page.size,
              },
            }
          : {}),
        ...(criteria.sort ? { sort: criteria.sort as ModelDeploymentTableSort } : {}),
      });
    },
    [onChange]
  );

  return (
    <>
      {noTable ? (
        <div style={{ paddingTop: 48, paddingBottom: 32 }}>
          <EuiEmptyPrompt
            style={{ maxWidth: 528 }}
            body={
              <EuiText size="s">
                <EuiSpacer size="l" />
                Deployed models will appear here. For more information, see{' '}
                <EuiLink
                  role="link"
                  href="https://opensearch.org/docs/latest/ml-commons-plugin/ml-dashboard/"
                  external
                  target="_blank"
                >
                  Machine Learning Documentation
                </EuiLink>
                .
                <EuiSpacer size="xl" />
              </EuiText>
            }
            aria-label="no deployed models"
          />
        </div>
      ) : (
        <EuiBasicTable
          columns={columns}
          sorting={sorting}
          onChange={handleChange}
          items={items}
          pagination={items.length > 0 ? pagination : undefined}
          noItemsMessage={
            <div style={{ padding: 40 }}>
              {loading ? (
                <EuiEmptyPrompt
                  body={
                    <EuiText size="s">
                      <EuiSpacer size="l" />
                      Loading deployed models...
                      <EuiSpacer size="xl" />
                    </EuiText>
                  }
                  aria-label="loading models"
                />
              ) : (
                <EuiEmptyPrompt
                  title={<EuiSpacer size="s" />}
                  body={
                    <EuiText size="s">
                      There are no results to your search. Reset the search criteria to view the
                      deployed models.
                    </EuiText>
                  }
                  actions={
                    <>
                      <EuiSpacer size="s" />
                      <EuiButton role="button" onClick={onResetSearchClick} size="m">
                        Reset search
                      </EuiButton>
                    </>
                  }
                  aria-label="no models results"
                />
              )}
            </div>
          }
        />
      )}
    </>
  );
};
