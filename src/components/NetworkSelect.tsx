import { Button, ButtonGroup, Heading, useToast } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useNetwork } from 'wagmi';

export const NetworkSelect = () => {
  // const [{ data, error, loading }, connect] = useConnect();
  const [{ data, error, loading }, switchNetwork] = useNetwork();

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

  if (!data) {
    return null;
  }

  return (
    <>
      {data.chain && (
        <Heading>
          Connected to {data.chain.name} {data.chain?.unsupported && '(unsupported)'}
        </Heading>
      )}

      {switchNetwork && (
        <ButtonGroup>
          {data.chains.map((x) =>
            x.id === data.chain?.id ? null : (
              <Button key={x.id} onClick={() => switchNetwork(x.id)}>
                Switch to {x.name}
              </Button>
            )
          )}
        </ButtonGroup>
      )}
    </>
  );
};

export default NetworkSelect;
