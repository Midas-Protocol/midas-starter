import { Box, Divider, Flex } from '@chakra-ui/react';

import { AccountButton } from '@components/shared/AccountButton';
import { useColors } from '@hooks/useColors';

const FuseNavbar = () => {
  const { cPage } = useColors();

  return (
    <>
      <Box bgColor={cPage.primary.bgColor} overflowX="hidden" mx="auto" w={'100%'}>
        <Flex mx="auto" alignItems="center" justifyContent="right" w={'100%'} py={2} gap={2}>
          <Box display="flex" flexDir="row" gap={4}>
            <AccountButton />
          </Box>
        </Flex>
      </Box>
      <Divider />
    </>
  );
};

export default FuseNavbar;
