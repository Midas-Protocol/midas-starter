import { Button, ButtonGroup, useToast } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useConnect } from 'wagmi';

export const ConnectorSelect = () => {
  const { connect, connectors, error: connectError } = useConnect();

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

  return (
    <ButtonGroup>
      {connectors.map((connector) => (
        <Button
          disabled={!connector.ready}
          key={connector.id}
          onClick={() => connect({ connector })}
        >
          {connector.name}
          {!connector.ready && ' (unsupported)'}
        </Button>
      ))}
    </ButtonGroup>
  );
};
export default ConnectorSelect;
