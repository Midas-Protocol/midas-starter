import { ChevronDownIcon } from '@chakra-ui/icons';
import { Button, Center, Img, Text, useDisclosure } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';

import SwitchNetworkModal from '@components/shared/SwitchNetworkModal';
import { ChainMetadata, getChainMetadata } from '@constants/networkData';
import { useRari } from '@context/RariContext';
import { useColors } from '@hooks/useColors';
import { useIsSmallScreen } from '@hooks/useIsSmallScreen';

const SwitchNetworkButton: React.FC = () => {
  const [chainMetadata, setChainMetadata] = useState<ChainMetadata | null>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useIsSmallScreen();
  const { networkData, networkBtnElement } = useRari();

  const { cSolidBtn } = useColors();

  useEffect(() => {
    if (networkData.chain?.id) {
      setChainMetadata(getChainMetadata(networkData.chain.id));
    }
  }, [networkData]);

  console.log(networkData);

  return (
    <Button
      ml={isMobile ? 2 : 4}
      height="40px"
      px={3}
      onClick={onOpen}
      color={cSolidBtn.primary.txtColor}
      bgColor={cSolidBtn.primary.bgColor}
      _hover={{
        background: cSolidBtn.primary.hoverBgColor,
        color: cSolidBtn.primary.hoverTxtColor,
      }}
      borderRadius={'xl'}
      fontSize={15}
      tabIndex={0}
      fontWeight="bold"
      ref={networkBtnElement}
    >
      <Center>
        {networkData.chain
          ? networkData.chain.unsupported
            ? 'Switch to supported network'
            : chainMetadata && (
                <>
                  {chainMetadata.img && (
                    <Img
                      width="25px"
                      height="25px"
                      borderRadius="50%"
                      src={chainMetadata.img}
                      alt=""
                    />
                  )}
                  {isMobile ? '' : <Text ml={2}>{chainMetadata.name}</Text>}
                </>
              )
          : 'Select a network'}
        <ChevronDownIcon ml={1} />
      </Center>
      <SwitchNetworkModal isOpen={isOpen} onClose={onClose} />
    </Button>
  );
};

export default SwitchNetworkButton;
