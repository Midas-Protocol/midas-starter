import { ComptrollerErrorCodes } from '@midas-capital/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleGenericError = (e: any, errorToast: (input: any) => any) => {
  let message: string;

  if (e instanceof Error) {
    message = e.toString();
  } else {
    message = e.message ?? JSON.stringify(e);
  }

  errorToast({ description: message });
};

export const errorCodeToMessage = (errorCode: number) => {
  switch (errorCode) {
    case ComptrollerErrorCodes.NO_ERROR:
      return undefined;
    case ComptrollerErrorCodes.NONZERO_BORROW_BALANCE:
      return 'You have to repay all your borrowed assets before you can disable any assets as collateral.';
    default:
      return 'Something went wrong. Please try again later.';
    // 'You cannot disable this asset as collateral as you would not have enough collateral posted to keep your borrow. Try adding more collateral of another type or paying back some of your debt.',
  }
};
