/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useState } from 'react';
import {
  EuiOverlayMask,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiModalFooter,
  EuiButton,
  EuiSpacer,
  EuiText,
  EuiForm,
  EuiFormRow,
  EuiFieldText,
} from '@elastic/eui';

import type { ModelDeploymentItem } from '../monitoring/model_deployment_table';
import { useDeleteModel } from '../../dashboard-assistant/modules/model/hooks';

export interface DeleteModelModalProps {
  model: ModelDeploymentItem;
  onClose: () => void;
  onDeleted?: () => void | Promise<void>;
}

export const DeleteModelModal = ({ model, onClose, onDeleted }: DeleteModelModalProps) => {
  const { deleteModel, isDeleting } = useDeleteModel();
  const [confirmationText, setConfirmationText] = useState('');

  const confirmDelete = useCallback(async () => {
    await deleteModel(model.id);
    onClose();
    if (onDeleted) await onDeleted();
  }, [deleteModel, model.id, onClose, onDeleted]);

  const updateConfirmationText = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const value = (e.target as HTMLInputElement).value;
    setConfirmationText(value);
  };

  return (
    <EuiOverlayMask>
      <EuiModal onClose={onClose} initialFocus="[name=modelName]">
        <EuiModalHeader>
          <EuiModalHeaderTitle>
            <h1>Delete model: {model.name}</h1>
          </EuiModalHeaderTitle>
        </EuiModalHeader>
        <EuiModalBody>
          <EuiText size="s">
            This action permanently deletes the model and related entities. To confirm, type the
            model name exactly.
          </EuiText>
          <EuiSpacer size="m" />
          <EuiForm component="form">
            <EuiFormRow label={`Type \"${model.name}\" to confirm`} fullWidth>
              <EuiFieldText
                fullWidth
                name="modelName"
                value={confirmationText}
                onChange={updateConfirmationText}
              />
            </EuiFormRow>
          </EuiForm>
        </EuiModalBody>
        <EuiModalFooter>
          <EuiButton onClick={onClose} color="text" data-test-subj="cancelDeleteModelButton">
            Cancel
          </EuiButton>
          <EuiButton
            fill
            color="danger"
            onClick={confirmDelete}
            isLoading={isDeleting}
            isDisabled={confirmationText.trim() !== model.name}
            data-test-subj="confirmDeleteModelButton"
          >
            Delete model
          </EuiButton>
        </EuiModalFooter>
      </EuiModal>
    </EuiOverlayMask>
  );
};
