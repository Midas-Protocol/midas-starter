import { Box, SimpleGrid as Grid, Skeleton, Stack, Text, TextProps } from '@chakra-ui/react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import FusePageLayout from '@components/pages/Fuse/FusePageLayout';
import PoolRow from '@components/pages/Fuse/FusePoolRow';
import PageTransitionLayout from '@components/shared/PageTransitionLayout';
import { MergedPool, useFusePools } from '@hooks/fuse/useFusePools';
import { useColors } from '@hooks/useColors';
import { Column, Row } from '@utils/chakraUtils';

const FusePoolsPage = memo(() => {
  return (
    <PageTransitionLayout>
      <FusePageLayout>
        <PoolList />
      </FusePageLayout>
    </PageTransitionLayout>
  );
});

export default FusePoolsPage;

const PoolList = () => {
  const { isLoading, filteredPools } = useFusePools();

  const [currentPage, setCurrentPage] = useState(1);
  const poolsPerPage = 6;
  const indexOfLastPool = currentPage * poolsPerPage;
  const indexOfFirstPool = indexOfLastPool - poolsPerPage;
  const currentPools = filteredPools?.slice(indexOfFirstPool, indexOfLastPool);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const { t } = useTranslation();

  return (
    <>
      <Text mt={12} fontWeight="bold" textAlign="center" fontSize={40}>
        {t('Pools list')}
      </Text>
      <Grid mt={8} w={'100%'} mx="auto" gap={4}>
        <Row crossAxisAlignment="center" mainAxisAlignment="flex-start">
          <Column mainAxisAlignment="center" crossAxisAlignment="center" width="30%">
            <Text fontWeight="bold" textAlign="center">
              {t('Pool Name')}
            </Text>
          </Column>
          <Column mainAxisAlignment="center" crossAxisAlignment="center" width="25%">
            <Text fontWeight="bold" textAlign="center">
              {t('Assets')}
            </Text>
          </Column>
          <Column mainAxisAlignment="center" crossAxisAlignment="center" width="15%">
            <Text fontWeight="bold" textAlign="center">
              {t('Total Supplied')}
            </Text>
          </Column>
          <Column mainAxisAlignment="center" crossAxisAlignment="center" width="18%">
            <Text fontWeight="bold" textAlign="center">
              {t('Total Borrowed')}
            </Text>
          </Column>
          <Column mainAxisAlignment="center" crossAxisAlignment="center" width="10%"></Column>
        </Row>
        {!isLoading ? (
          currentPools.length ? (
            <>
              {currentPools.map((pool: MergedPool, index: number) => {
                return <PoolRow data={pool} key={index} />;
              })}
            </>
          ) : (
            <Text width="100%" textAlign="center" fontWeight="bold" fontSize={24} my={24}>
              No pools found
            </Text>
          )
        ) : (
          <Stack width="100%" mx="auto" mt={2}>
            <Skeleton height="80px" borderRadius={12} />
            <Skeleton height="80px" borderRadius={12} />
            <Skeleton height="80px" borderRadius={12} />
          </Stack>
        )}
      </Grid>
      <Box w="100%" mx="auto" mb="10" mt={10} textAlign="center">
        <Pagination
          currentPage={currentPage}
          poolsPerPage={poolsPerPage}
          totalPools={filteredPools.length}
          paginate={paginate}
        />
      </Box>
    </>
  );
};

const Pagination = ({
  totalPools,
  poolsPerPage,
  paginate,
  currentPage,
}: {
  totalPools: number;
  poolsPerPage: number;
  paginate: (pageNumber: number) => void;
  currentPage: number;
}) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalPools / poolsPerPage); i++) {
    pageNumbers.push(i);
  }

  const { cOutlineBtn } = useColors();

  const selectedProps: TextProps = {
    bg: cOutlineBtn.primary.selectedBgColor,
    color: cOutlineBtn.primary.selectedTxtColor,
    borderColor: cOutlineBtn.primary.borderColor,
  };
  const unSelectedProps: TextProps = {
    _hover: {
      bg: cOutlineBtn.primary.hoverBgColor,
      color: cOutlineBtn.primary.hoverTxtColor,
      borderColor: cOutlineBtn.primary.borderColor,
    },
    color: cOutlineBtn.primary.txtColor,
  };

  return (
    <Box py="4" width="100%">
      {pageNumbers.map((num: number, index: number) => (
        <Text
          fontSize="lg"
          display="inline"
          px="4"
          py="2"
          borderRadius="5px"
          onClick={() => paginate(num)}
          cursor="pointer"
          shadow="lg"
          mx="2"
          fontWeight={'bold'}
          borderColor={cOutlineBtn.primary.borderColor}
          borderWidth={2}
          key={index}
          {...(currentPage === num ? selectedProps : unSelectedProps)}
        >
          {num}
        </Text>
      ))}
    </Box>
  );
};
