import {
  Button,
  Grid,
  Heading,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import React, { useMemo } from 'react';

import { ModalDivider } from '@components/shared/Modal';
import { getChainMetadata } from '@constants/networkData';
import { useRari } from '@context/RariContext';
import { useColors } from '@hooks/useColors';

const SwitchNetworkModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { networkData, switchNetwork } = useRari();

  const { cSolidBtn, cOutlineBtn, cCard } = useColors();
  const supportedChains = useMemo(() => {
    return networkData.chains?.map((chain: any) => {
      return getChainMetadata(chain.id);
    });
  }, [networkData]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size={'xl'}>
      <ModalOverlay />
      <ModalContent
        bg={cCard.bgColor}
        borderRadius="20px"
        border="2px"
        borderColor={cCard.borderColor}
      >
        <ModalHeader fontSize="1.5rem">Select a Network</ModalHeader>
        <ModalCloseButton />
        <ModalDivider />
        <ModalBody mt={4}>
          <Heading fontSize={'lg'} fontWeight={'medium'} lineHeight={'tall'}>
            {networkData.chain ? (
              <Text>
                Currently using{' '}
                <Text as="span" fontWeight={'extrabold'}>
                  Midas
                </Text>{' '}
                on the{' '}
                <Text as="span" fontWeight={'extrabold'}>
                  {networkData.chain?.name} {networkData.chain?.unsupported && '(Unsupported)'}
                </Text>{' '}
                network.
              </Text>
            ) : (
              <Text>Connect a wallet first</Text>
            )}
          </Heading>
          <Grid
            templateColumns={{ base: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
            gap={{ base: 4, sm: 6 }}
            mt={6}
          >
            {switchNetwork &&
              supportedChains.map(
                (chainMetadata: any) =>
                  chainMetadata && (
                    <Button
                      variant={
                        networkData.chain?.id === chainMetadata.chainId ? 'solid' : 'outline'
                      }
                      key={chainMetadata.chainId}
                      h={'12'}
                      justifyContent={'flex-start'}
                      fontSize={'md'}
                      borderRadius={12}
                      borderColor={
                        networkData.chain?.id !== chainMetadata.chainId
                          ? cOutlineBtn.primary.borderColor
                          : undefined
                      }
                      borderWidth={2}
                      disabled={!chainMetadata.enabled}
                      bg={
                        networkData.chain?.id === chainMetadata.chainId
                          ? cOutlineBtn.primary.selectedBgColor
                          : undefined
                      }
                      _hover={{
                        background: cOutlineBtn.primary.hoverBgColor,
                        color:
                          networkData.chain?.id !== chainMetadata.chainId
                            ? cOutlineBtn.primary.hoverTxtColor
                            : undefined,
                      }}
                      color={
                        networkData.chain?.id === chainMetadata.chainId
                          ? cOutlineBtn.primary.selectedTxtColor
                          : cOutlineBtn.primary.txtColor
                      }
                      onClick={async () => {
                        await switchNetwork(chainMetadata.chainId);
                      }}
                    >
                      <Image
                        h={'8'}
                        mr={'4'}
                        borderRadius={'50%'}
                        src={chainMetadata.img}
                        alt=""
                      ></Image>
                      {chainMetadata.name}
                      {chainMetadata.enabled ? '' : ' (Soon)'}
                    </Button>
                  )
              )}
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

export default SwitchNetworkModal;
