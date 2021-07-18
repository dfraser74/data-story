import React, { FC } from 'react';
import modalStyle from '@data-story-org/core/src/utils/modalStyle';
import NodeWidgetModal from '../../modals/NodeWidgetModal';
import { observer } from 'mobx-react';
import Modal from 'react-modal';
import NodeModel from '../../../NodeModel';

interface Props {
  node: NodeModel;
  isOpen: () => boolean;
  closeModal: () => void;
}

const NodeModal: FC<Props> = ({
  node,
  isOpen,
  closeModal,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      style={modalStyle}
    >
      <NodeWidgetModal
        node={node}
        closeModal={closeModal}
      />
    </Modal>
  );
};

export default observer(NodeModal);
