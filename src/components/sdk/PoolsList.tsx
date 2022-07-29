import { CheckIcon, CopyIcon } from '@chakra-ui/icons';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  HStack,
  IconButton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useClipboard,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { FusePoolData, NativePricedFuseAsset } from '@midas-capital/sdk';
import { useEffect } from 'react';
import { useQuery } from 'react-query';

import { useSDK } from '@context/SDKContext';
import { shortAddress } from '@utils/shortAddress';

const PoolsList = () => {
  const { sdk, address, currentChain } = useSDK();
  const { data: allPools } = useQuery(
    ['allPools', address, currentChain.id],
    async () => {
      return await sdk.fetchPoolsManual({
        verification: false,
        options: {
          from: address,
        },
      });
    },
    { cacheTime: Infinity, staleTime: Infinity, enabled: !!address && !!currentChain.id }
  );

  console.log(allPools);

  return (
    <Box width="100%">
      <Accordion allowToggle>
        <AccordionItem borderWidth={1} borderColor="teal">
          <h2>
            <AccordionButton _expanded={{ bg: 'teal', color: 'white' }}>
              <Box flex="1" textAlign="left" fontWeight="bold">
                Get all pools
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <TableContainer>
              <Table variant="striped" colorScheme="gray" overflowX="scroll">
                <Thead>
                  <Tr>
                    <Th fontSize={14}>ID</Th>
                    <Th fontSize={14}>Name / Address</Th>
                    <Th fontSize={14}>Creator</Th>
                    <Th fontSize={14}>Assets / Addresses</Th>
                    <Th fontSize={14}>
                      Total<br></br>Supplied
                    </Th>
                    <Th fontSize={14}>
                      Total<br></br>Borrowed
                    </Th>
                    <Th fontSize={14}>
                      Your<br></br>Supplied
                    </Th>
                    <Th fontSize={14}>
                      Your<br></br>Borrowed
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {allPools &&
                    allPools.map((pool, index) => {
                      return pool && <PoolInfo key={index} pool={pool} />;
                    })}
                </Tbody>
              </Table>
            </TableContainer>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
};

const PoolInfo = ({ pool }: { pool: FusePoolData }) => {
  const { hasCopied: hasCopiedPoolAddress, onCopy: onCopyPoolAddress } = useClipboard(
    pool.comptroller
  );
  const { hasCopied: hasCopiedPoolCreator, onCopy: onCopyPoolCreator } = useClipboard(pool.creator);

  const toast = useToast();

  useEffect(() => {
    if (hasCopiedPoolAddress || hasCopiedPoolCreator) {
      toast({
        title: 'Copied to clipboard',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    }
  }, [hasCopiedPoolAddress, hasCopiedPoolCreator, toast]);

  return (
    <Tr>
      <Td>{pool.id}</Td>
      <Td>
        <VStack>
          <Text w="100%">{pool.name}</Text>
          <HStack w="100%" alignItems="baseline">
            <Text>{shortAddress(pool.comptroller)}</Text>
            <IconButton
              variant="unstyled"
              aria-label="Pool Address"
              fontSize="20px"
              icon={hasCopiedPoolAddress ? <CheckIcon /> : <CopyIcon />}
              onClick={onCopyPoolAddress}
              height="auto"
              minWidth="auto"
            />
          </HStack>
        </VStack>
      </Td>
      <Td>
        <HStack w="100%" alignItems="baseline">
          <Text>{shortAddress(pool.creator)}</Text>
          <IconButton
            variant="unstyled"
            aria-label="Pool Creator"
            fontSize="20px"
            icon={hasCopiedPoolCreator ? <CheckIcon /> : <CopyIcon />}
            onClick={onCopyPoolCreator}
            height="auto"
            minWidth="auto"
          />
        </HStack>
      </Td>
      <Td>
        <VStack>
          {pool.assets.length !== 0 &&
            pool.assets.map((asset, index) => {
              return <AssetInfo key={index} asset={asset} />;
            })}
        </VStack>
      </Td>
      <Td>{pool.totalSuppliedNative.toFixed(4)}</Td>
      <Td>{pool.totalBorrowedNative.toFixed(4)}</Td>
      <Td>{pool.totalSupplyBalanceNative.toFixed(4)}</Td>
      <Td>{pool.totalBorrowBalanceNative.toFixed(4)}</Td>
    </Tr>
  );
};

const AssetInfo = ({ asset }: { asset: NativePricedFuseAsset }) => {
  const { hasCopied: hasCopiedAssetCToken, onCopy: onCopyAssetCToken } = useClipboard(asset.cToken);
  const toast = useToast();

  useEffect(() => {
    if (hasCopiedAssetCToken) {
      toast({
        title: 'Copied to clipboard',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
    }
  }, [hasCopiedAssetCToken, toast]);

  return (
    <HStack width="100%">
      <Text>{`${asset.underlyingSymbol} / `}</Text>
      <Text>{shortAddress(asset.cToken)}</Text>
      <IconButton
        variant="unstyled"
        aria-label="Pool Creator"
        fontSize="20px"
        icon={hasCopiedAssetCToken ? <CheckIcon /> : <CopyIcon />}
        onClick={onCopyAssetCToken}
        height="auto"
        minWidth="auto"
      />
    </HStack>
  );
};

export default PoolsList;
