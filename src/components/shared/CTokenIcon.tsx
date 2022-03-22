import { Avatar, AvatarGroup, AvatarGroupProps, AvatarProps } from '@chakra-ui/avatar';
import { Tooltip } from '@chakra-ui/react';
import React from 'react';

import { useTokenData } from '@hooks/useTokenData';

export const CTokenIcon = ({
  address,
  ...avatarProps
}: {
  address: string;
} & Partial<AvatarProps>) => {
  const { data: tokenData } = useTokenData(address);

  return (
    <Tooltip label={tokenData?.symbol}>
      <Avatar
        {...avatarProps}
        key={address}
        bg="#FFF"
        borderWidth="1px"
        name={tokenData?.symbol ?? 'Loading...'}
        src={
          tokenData?.logoURL ??
          'https://raw.githubusercontent.com/feathericons/feather/master/icons/help-circle.svg'
        }
      />
    </Tooltip>
  );
};

export const CTokenAvatarGroup = ({
  tokenAddresses,
  popOnHover = false,
  ...avatarGroupProps
}: {
  tokenAddresses: string[];
  popOnHover: boolean;
} & Partial<AvatarGroupProps>) => {
  return (
    <AvatarGroup size="xs" max={30} {...avatarGroupProps}>
      {tokenAddresses.map((tokenAddress) => {
        return (
          <CTokenIcon
            key={tokenAddress}
            address={tokenAddress}
            _hover={popOnHover ? { transform: 'scale(1.2)', zIndex: 5 } : undefined}
          />
        );
      })}
    </AvatarGroup>
  );
};
