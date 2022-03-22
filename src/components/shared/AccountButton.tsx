import {
  AvatarGroup,
  Button,
  Link,
  Modal,
  ModalContent,
  ModalOverlay,
  Spinner,
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { TransactionResponse } from '@ethersproject/providers';
import { ClaimableReward } from '@midas-capital/sdk/dist/cjs/src/modules/RewardsDistributor';
import { memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import CTokenIcon from '@components/pages/Fuse/CTokenIcon';
import ClaimRewardsModal from '@components/pages/Fuse/Modals/ClaimRewardsModal';
import { GlowingBox } from '@components/shared/GlowingBox';
import Jazzicon from '@components/shared/Jazzicon';
import { ModalDivider, ModalTitleWithCloseButton } from '@components/shared/Modal';
import SwitchNetworkButton from '@components/shared/SwitchNetworkButton';
import { LanguageSelect } from '@components/shared/TranslateButton';
import { useRari } from '@context/RariContext';
import { useAllClaimableRewards } from '@hooks/rewards/useAllClaimableRewards';
import { useAuthedCallback } from '@hooks/useAuthedCallback';
import { useColors } from '@hooks/useColors';
import { useIsSmallScreen } from '@hooks/useIsSmallScreen';
import { Center, Column, Row } from '@utils/chakraUtils';
import { shortAddress } from '@utils/shortAddress';

export const AccountButton = memo(() => {
  const {
    isOpen: isSettingsModalOpen,
    onOpen: openSettingsModal,
    onClose: closeSettingsModal,
  } = useDisclosure();

  const authedOpenSettingsModal = useAuthedCallback(openSettingsModal);
  return (
    <>
      <SettingsModal isOpen={isSettingsModalOpen} onClose={closeSettingsModal} />
      <Buttons openModal={authedOpenSettingsModal} />
    </>
  );
});

const ClaimRewardsButton = () => {
  const {
    isOpen: isClaimModalOpen,
    onOpen: openClaimModal,
    onClose: closeClaimModal,
  } = useDisclosure();
  const authedOpenModal = useAuthedCallback(openClaimModal);

  const { cSolidBtn } = useColors();
  const { t } = useTranslation();

  const { data: claimableRewards } = useAllClaimableRewards();

  return (
    <>
      <ClaimRewardsModal
        isOpen={isClaimModalOpen}
        onClose={closeClaimModal}
        claimableRewards={claimableRewards}
      />
      {claimableRewards && claimableRewards.length !== 0 && (
        <GlowingBox
          as="button"
          height="40px"
          onClick={authedOpenModal}
          color={cSolidBtn.primary.txtColor}
          borderRadius={'xl'}
          px={2}
        >
          <Center>
            <AvatarGroup size="sm" max={30}>
              {claimableRewards?.map((rD: ClaimableReward, index: number) => {
                return <CTokenIcon key={index} address={rD.rewardToken} />;
              })}
            </AvatarGroup>
            <Text ml={1} mr={1} fontWeight="semibold">
              {t('Claim Rewards')}
            </Text>
          </Center>
        </GlowingBox>
      )}
    </>
  );
};

const Buttons = ({ openModal }: { openModal: () => void }) => {
  const { address, isAuthed, login, isAttemptingLogin, pendingTxHashes } = useRari();

  const { t } = useTranslation();

  const isMobile = useIsSmallScreen();

  const handleAccountButtonClick = useCallback(() => {
    if (isAuthed) {
      openModal();
    } else login();
  }, [isAuthed, login, openModal]);
  const { cSolidBtn } = useColors();
  return (
    <Row mainAxisAlignment="center" crossAxisAlignment="center">
      <ClaimRewardsButton />
      <SwitchNetworkButton />
      <Button
        ml={isMobile ? 2 : 4}
        height="40px"
        onClick={handleAccountButtonClick}
        color={cSolidBtn.primary.txtColor}
        bgColor={cSolidBtn.primary.bgColor}
        _hover={{
          background: cSolidBtn.primary.hoverBgColor,
          color: cSolidBtn.primary.hoverTxtColor,
        }}
        borderRadius={'xl'}
        px={3}
      >
        {!isAuthed ? (
          isAttemptingLogin ? (
            <Spinner />
          ) : (
            <Text fontWeight="semibold">{t('Connect')}</Text>
          )
        ) : (
          <Center>
            {pendingTxHashes.length === 0 ? (
              <>
                <Stack border="transparent" w="100%" h="100%" direction="row" spacing={8}>
                  <Jazzicon diameter={23} address={address} style={{ display: 'contents' }} />
                </Stack>
                <Text ml={2} mt={1} fontWeight="semibold">
                  {shortAddress(address)}
                </Text>
              </>
            ) : (
              <>
                <Text mr={2} fontWeight="semibold">
                  {pendingTxHashes.length} Pending
                </Text>
                <Spinner w={5} h={5} />
              </>
            )}
          </Center>
        )}
      </Button>
    </Row>
  );
};

export const SettingsModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { t } = useTranslation();

  const { login, logout, pendingTxHashes, fuse } = useRari();
  const { cSolidBtn, cCard } = useColors();
  const modalStyle = {
    backgroundColor: cCard.bgColor,
    width: { md: '450px', base: '92%' },
    color: cCard.txtColor,
    borderRadius: '10px',
    border: `2px solid ${cCard.borderColor}`,
  };
  const onSwitchWallet = () => {
    onClose();
    setTimeout(() => login(false), 100);
  };

  const handleDisconnectClick = () => {
    onClose();
    logout();
  };

  const [, setTxInfo] = useState<Array<TransactionResponse>>();

  useEffect(() => {
    const func = async () => {
      const info = await Promise.all(
        pendingTxHashes.map(async (hash) => {
          return await fuse.provider.getTransaction(hash);
        })
      );
      setTxInfo(info);
    };

    if (pendingTxHashes.length) {
      func();
    }
  }, [pendingTxHashes, fuse]);

  return (
    <Modal motionPreset="slideInBottom" isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent {...modalStyle}>
        <ModalTitleWithCloseButton text={t('Account')} onClose={onClose} />

        <ModalDivider />

        <Column width="100%" mainAxisAlignment="flex-start" crossAxisAlignment="center" p={4}>
          <Button
            bg={cSolidBtn.primary.bgColor}
            color={cSolidBtn.primary.txtColor}
            width="100%"
            height="45px"
            fontSize="xl"
            borderRadius="7px"
            fontWeight="bold"
            onClick={onSwitchWallet}
            _hover={{ bg: cSolidBtn.primary.hoverBgColor }}
            _active={{}}
            mb={4}
          >
            {t('Switch Wallet')}
          </Button>

          <Button
            bg={cSolidBtn.secondary.bgColor}
            color={cSolidBtn.secondary.txtColor}
            width="100%"
            height="45px"
            fontSize="xl"
            borderRadius="7px"
            fontWeight="bold"
            onClick={handleDisconnectClick}
            _hover={{}}
            _active={{}}
            mb={4}
          >
            {t('Disconnect')}
          </Button>

          <LanguageSelect />
          <Row
            mainAxisAlignment="center"
            crossAxisAlignment="center"
            mt={4}
            width="100%"
            color={cCard.txtColor}
          >
            {!pendingTxHashes.length ? (
              <Text>Your transactions will appear here</Text>
            ) : (
              <>
                <Text>Recent transactions</Text>
              </>
            )}
          </Row>

          <Row
            mainAxisAlignment="center"
            crossAxisAlignment="center"
            mt={4}
            width="100%"
            color={cCard.txtColor}
          >
            <Link target="_blank" href="https://docs.midas.capital/">
              <Text mx={2} size="sm" textDecoration="underline">
                {t('Docs')}
              </Text>
            </Link>
            <Link target="_blank" href="https://www.notion.so/Midas-Capital">
              <Text mx={2} size="sm" textDecoration="underline">
                {t('Notion')}
              </Text>
            </Link>
            <Link target="_blank" href="https://www.notion.so/Midas-Capital-Audit">
              <Text mx={2} size="sm" textDecoration="underline">
                {t('Audit')}
              </Text>
            </Link>
          </Row>

          <Text mt={4} fontSize="10px" color={cCard.txtColor}>
            {t('Version')}
          </Text>
        </Column>
      </ModalContent>
    </Modal>
  );
};
