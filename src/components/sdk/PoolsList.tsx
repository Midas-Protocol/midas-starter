import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
} from '@chakra-ui/react';

import { useSDK } from '@context/SDKContext';

const PoolsList = () => {
  const { sdk } = useSDK();

  if (!sdk) {
    return null;
  }

  return (
    <Box width="100%">
      <Accordion defaultIndex={[0]} allowMultiple>
        <AccordionItem borderWidth={1} borderColor="teal">
          <h2>
            <AccordionButton _expanded={{ bg: 'teal', color: 'white' }}>
              <Box flex="1" textAlign="left">
                Get all pools
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>All pools here</AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
};

export default PoolsList;
