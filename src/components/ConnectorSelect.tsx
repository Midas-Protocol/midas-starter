import { Button, ButtonGroup, useToast } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useConnect } from 'wagmi';

export const ConnectorSelect = () => {
  const [{ data, error, loading }, connect] = useConnect();

  const toast = useToast({
    status: 'error',
    duration: 5000,
    isClosable: true,
    position: 'bottom-right',
  });

  useEffect(() => {
    if (error) {
      toast({ title: error.name, description: error.message });
    }
  }, [error, toast]);

  return (
    <ButtonGroup>
      {data.connectors.map((connector) => (
        <Button disabled={!connector.ready} key={connector.id} onClick={() => connect(connector)}>
          {connector.name}
          {!connector.ready && ' (unsupported)'}
        </Button>
      ))}
    </ButtonGroup>
  );
};
export default ConnectorSelect;
