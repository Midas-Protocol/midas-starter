import {
  Button,
  Grid,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
} from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { ModalDivider } from '@components/shared/Modal';
import { useRari } from '@context/RariContext';
import { useColors } from '@hooks/useColors';

const ConnectWalletModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { connectData, connectError, connect } = useRari();
  const { cSolidBtn, cCard } = useColors();
  const { t } = useTranslation();
  const toast = useToast();

  useEffect(() => {
    if (connectError) {
      toast({
        title: 'Error!',
        description: connectError?.message ?? 'Failed to connect',
        status: 'error',
        duration: 9000,
        isClosable: true,
        position: 'top-right',
      });
    }
  }, [connectError, toast]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size={'xl'}>
      <ModalOverlay />
      <ModalContent
        bg={cCard.bgColor}
        borderRadius="20px"
        border="2px"
        borderColor={cCard.borderColor}
      >
        <ModalHeader fontSize="1.5rem">{t('Select a Wallet')}</ModalHeader>
        <ModalCloseButton />
        <ModalDivider />
        <ModalBody mt={4}>
          <Grid
            templateColumns={{ base: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
            gap={{ base: 4, sm: 6 }}
            mt={6}
          >
            {connectData.connectors.map((connector: any) => (
              <Button
                disabled={!connector.ready}
                key={connector.id}
                onClick={() => {
                  connect(connector);
                  onClose();
                }}
              >
                {connector.name}
                {!connector.ready && ' (unsupported)'}
              </Button>
            ))}
          </Grid>
        </ModalBody>

        <ModalFooter>
          <Button
            mr={3}
            color={cSolidBtn.secondary.txtColor}
            onClick={onClose}
            background={cSolidBtn.secondary.bgColor}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ConnectWalletModal;
