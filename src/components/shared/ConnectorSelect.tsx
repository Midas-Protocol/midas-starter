import { CloseIcon } from '@chakra-ui/icons';
import { Button, ButtonGroup, IconButton, useToast } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

import { shortAddress } from '@utils/shortAddress';

const ConnectorSelect = () => {
  const { connect, connectors, error: connectError } = useConnect();
  const { address } = useAccount();
  const { disconnect } = useDisconnect();

  const toast = useToast({
    status: 'error',
    duration: 5000,
    isClosable: true,
    position: 'bottom-right',
  });

  useEffect(() => {
    if (connectError) {
      toast({ title: connectError.name, description: connectError.message });
    }
  }, [connectError, toast]);

  return !address ? (
    <ButtonGroup>
      {connectors.map((connector) => (
        <Button
          disabled={!connector.ready}
          key={connector.id}
          onClick={() => connect({ connector })}
          colorScheme="teal"
          variant="solid"
        >
          {connector.name}
          {!connector.ready && ' (unsupported)'}
        </Button>
      ))}
    </ButtonGroup>
  ) : (
    <ButtonGroup size="md" isAttached variant="outline">
      <Button colorScheme="teal" variant="solid">
        {shortAddress(address)}
      </Button>
      <IconButton
        bg={'transparent'}
        aria-label="Disconnect"
        onClick={() => {
          disconnect();
        }}
        icon={<CloseIcon />}
        colorScheme="teal"
      />
    </ButtonGroup>
  );
};

export default ConnectorSelect;
