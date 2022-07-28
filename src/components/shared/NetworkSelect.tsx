import { Button, ButtonGroup, useToast } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useNetwork, useSwitchNetwork } from 'wagmi';

export const NetworkSelect = () => {
  const { chain, chains } = useNetwork();
  const { error, switchNetwork } = useSwitchNetwork();

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

  if (!chain) {
    return null;
  }

  return (
    <>
      {switchNetwork && (
        <ButtonGroup>
          {chains.map((x) =>
            x.id === chain.id ? null : (
              <Button
                key={x.id}
                onClick={() => switchNetwork(x.id)}
                variant="solid"
                colorScheme="teal"
              >
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
