import { Avatar, AvatarProps, Tooltip } from '@chakra-ui/react';
import { motion } from 'framer-motion';

import { useTokenData } from '@hooks/useTokenData';

const CTokenIcon = ({ address, ...avatarProps }: { address: string } & Partial<AvatarProps>) => {
  const { data: tokenData } = useTokenData(address);

  return (
    <motion.div whileHover={{ scale: 1.2 }}>
      <Tooltip label={tokenData?.symbol}>
        <Avatar
          {...avatarProps}
          key={address}
          bg={'transparent'}
          borderWidth="1px"
          name={tokenData?.symbol ?? 'Loading...'}
          borderColor={'transparent'}
          src={
            tokenData?.logoURL ??
            'https://raw.githubusercontent.com/feathericons/feather/master/icons/help-circle.svg'
          }
        />
      </Tooltip>
    </motion.div>
  );
};

export default CTokenIcon;
