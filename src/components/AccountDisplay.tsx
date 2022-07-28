import { CloseIcon } from '@chakra-ui/icons';
import { Box, Code, HStack, IconButton } from '@chakra-ui/react';
import { useAccount, useDisconnect } from 'wagmi';

export const AccountDisplay = () => {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();

  if (!address) {
    return null;
  }
  return (
    <Box borderRadius={'md'} borderWidth={1} borderColor="brand.900" maxWidth="md">
      <HStack justifyContent={'space-between'} pl={2}>
        <Code>{address}</Code>
        <IconButton
          bg={'transparent'}
          aria-label="Disconnect"
          onClick={() => {
            disconnect();
          }}
          icon={<CloseIcon />}
        />
      </HStack>
    </Box>
  );
};
