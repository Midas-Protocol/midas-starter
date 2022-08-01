import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
} from '@chakra-ui/react';
import { utils } from 'ethers';
import { ChangeEvent, useState } from 'react';
import { useQueryClient } from 'react-query';

import { CLOSE_FACTOR, LIQUIDATION_INCENTIVE } from '@constants/constants';
import { useSDK } from '@context/SDKContext';
import { useErrorToast, useSuccessToast } from '@hooks/useToast';
import { handleGenericError } from '@utils/errorHandling';

export const CreatePool = () => {
  const { sdk, address } = useSDK();
  const [whitelisted, setWhitelisted] = useState<string>('');
  const [closeFactor, setCloseFactor] = useState<number>(CLOSE_FACTOR.DEFAULT);
  const [liquidationIncentive, setLiquidationIncentive] = useState<number>(
    LIQUIDATION_INCENTIVE.DEFAULT
  );
  const [poolName, setPoolName] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [oracle, setOracle] = useState<string>(sdk.chainDeployment.MasterPriceOracle.address);

  const successToast = useSuccessToast();
  const errorToast = useErrorToast();
  const queryClient = useQueryClient();

  const onCloseFactor = (value: string) => {
    setCloseFactor(Number(value));
  };

  const onLiquidationIncentive = (value: string) => {
    setLiquidationIncentive(Number(value));
  };

  const onWhitelisted = (e: ChangeEvent<HTMLInputElement>) => {
    setWhitelisted(e.target.value);
  };

  const onPoolName = (e: ChangeEvent<HTMLInputElement>) => {
    setPoolName(e.target.value);
  };

  const onOracle = (e: ChangeEvent<HTMLSelectElement>) => {
    setOracle(e.target.value);
  };

  const onDeploy = async () => {
    let whitelistedAddresses = whitelisted.split(',');
    whitelistedAddresses = whitelistedAddresses.filter((value) => utils.isAddress(value));

    setIsCreating(true);
    // 50% -> 50 * (1e18 / 100)
    const bigCloseFactor = utils.parseUnits(closeFactor.toString(), 16);

    // 8% -> 108 * (1e18 / 100)
    const bigLiquidationIncentive = utils.parseUnits((liquidationIncentive + 100).toString(), 16);

    const reporter = null;

    try {
      const deployResult = await sdk.deployPool(
        poolName,
        whitelistedAddresses.length !== 0,
        bigCloseFactor,
        bigLiquidationIncentive,
        oracle,
        { reporter },
        { from: address },
        whitelistedAddresses
      );

      const poolId = deployResult[3];

      if (!poolId) {
        errorToast({ description: 'pool Id not exists' });
        return;
      }

      const poolData = await sdk.fetchFusePoolData(poolId.toString(), address);
      const unitroller = sdk.createUnitroller(poolData.comptroller);
      const tx = await unitroller._acceptAdmin();
      await tx.wait();

      successToast({
        title: 'Your pool has been deployed!',
        description: 'You may now add assets to it.',
      });

      setPoolName('');
      setCloseFactor(CLOSE_FACTOR.DEFAULT);
      setLiquidationIncentive(LIQUIDATION_INCENTIVE.DEFAULT);
      setWhitelisted('');

      await queryClient.refetchQueries();
    } catch (e) {
      handleGenericError(e, errorToast);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Box width="100%">
      <Accordion allowToggle>
        <AccordionItem borderWidth={1} borderColor="teal">
          <h2>
            <AccordionButton _expanded={{ bg: 'teal', color: 'white' }}>
              <Box flex="1" textAlign="left" fontWeight="bold">
                Create Pool
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <Flex direction="column" gap={4}>
              <Flex width="100%" direction="row" gap={4}>
                <FormControl flex={5}>
                  <FormLabel>Pool Name</FormLabel>
                  <Input
                    type="text"
                    placeholder="Input pool name"
                    value={poolName}
                    onChange={onPoolName}
                  />
                </FormControl>
                <FormControl flex={3}>
                  <FormLabel>Oracle</FormLabel>
                  <Select onChange={onOracle}>
                    <option
                      className="white-bg-option"
                      value={sdk.chainDeployment.MasterPriceOracle.address}
                    >
                      MasterPriceOracle
                    </option>
                    <option
                      className="white-bg-option"
                      value={sdk.chainDeployment.MasterPriceOracle.address}
                    >
                      MasterPriceOracle
                    </option>
                  </Select>
                </FormControl>
                <FormControl flex={2}>
                  <FormLabel>Close Factor</FormLabel>
                  <NumberInput
                    defaultValue={CLOSE_FACTOR.DEFAULT}
                    min={CLOSE_FACTOR.MIN}
                    max={CLOSE_FACTOR.MAX}
                    value={closeFactor}
                    keepWithinRange={false}
                    clampValueOnBlur={false}
                    onChange={onCloseFactor}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                <FormControl flex={2}>
                  <FormLabel>Liquidation Incentive</FormLabel>
                  <NumberInput
                    defaultValue={LIQUIDATION_INCENTIVE.DEFAULT}
                    min={LIQUIDATION_INCENTIVE.MIN}
                    max={LIQUIDATION_INCENTIVE.MAX}
                    value={liquidationIncentive}
                    keepWithinRange={false}
                    clampValueOnBlur={false}
                    onChange={onLiquidationIncentive}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </Flex>
              <HStack width="100%" gap={8}>
                <FormControl>
                  <FormLabel>WhiteListed (Input addresses with COMMA only)</FormLabel>
                  <Input
                    value={whitelisted}
                    onChange={onWhitelisted}
                    placeholder="Input WhiteListed addresses with comma"
                  />
                </FormControl>
              </HStack>
              <Button
                ml="auto"
                width="100px"
                colorScheme="teal"
                onClick={onDeploy}
                isDisabled={
                  !poolName ||
                  !oracle ||
                  closeFactor > CLOSE_FACTOR.MAX ||
                  closeFactor < CLOSE_FACTOR.MIN ||
                  liquidationIncentive > LIQUIDATION_INCENTIVE.MAX ||
                  liquidationIncentive < LIQUIDATION_INCENTIVE.MIN
                }
                isLoading={isCreating}
              >
                Create
              </Button>
            </Flex>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
};
