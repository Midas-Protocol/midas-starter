import { CloseIcon } from '@chakra-ui/icons';
import { Avatar, Box, Code, HStack, IconButton } from '@chakra-ui/react';
import { useAccount } from 'wagmi';

export const AccountDisplay = () => {
  const [{ data: accountData }, disconnect] = useAccount({
    fetchEns: false,
  });

  if (!accountData) {
    return null;
  }
  return (
    <Box borderRadius={'md'} borderWidth={1} borderColor="brand.900" maxWidth="md">
      <HStack justifyContent={'space-between'} pl={2}>
        {accountData.ens?.avatar && <Avatar name="ENS Avatar" src={accountData.ens?.avatar} />}

        <Code>{accountData.ens?.name ? accountData.ens.name : accountData.address}</Code>
        <IconButton
          bg={'transparent'}
          aria-label="Disconnect"
          onClick={disconnect}
          icon={<CloseIcon />}
        />
      </HStack>
    </Box>
  );
};
