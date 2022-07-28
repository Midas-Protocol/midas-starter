import { Box, Container, Flex, Spacer, Text } from '@chakra-ui/react';
import dynamic from 'next/dynamic';

const DynamicConnectorSelect = dynamic(() => import('@components/shared/ConnectorSelect'), {
  ssr: false,
});

const DynamicNetworkSelect = dynamic(() => import('@components/shared/NetworkSelect'), {
  ssr: false,
});

const TopNav = () => {
  return (
    <Box borderBottom="1px" width="100%" borderColor="gray.300" mb={8}>
      <Container maxWidth="8xl" px={{ base: 2, md: 4 }}>
        <Flex w={'100%'} justifyContent="flex-start" alignItems="center">
          <Text width={300} fontSize={32} p={4}>
            Midas Starter
          </Text>
          <Spacer />
          <Flex justifyContent="flex-start" alignItems="center" direction="row" gap={4}>
            <DynamicNetworkSelect />
            <DynamicConnectorSelect />
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
};

export default TopNav;
