import { Container, Flex } from '@chakra-ui/react';
import { ReactNode } from 'react';

import TopNav from '@components/page/TopNav';

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <Flex height="100%" flex={1} direction="column" justifyContent="flex-start" alignItems="center">
      <TopNav />
      <Container maxWidth="8xl" px={{ base: 2, md: 4 }}>
        <Flex
          width={'96%'}
          height="100%"
          flex={1}
          mx="auto"
          justifyContent="center"
          alignItems="stretch"
          position="relative"
        >
          {children}
        </Flex>
      </Container>
    </Flex>
  );
};

export default Layout;
