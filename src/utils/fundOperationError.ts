import { ComptrollerErrorCodes, CTokenErrorCodes } from '@midas-capital/sdk';

import { config } from '@config/config';

export function fundOperationError(errorCode: number) {
  let err;

  if (errorCode >= 1000) {
    const comptrollerResponse = errorCode - 1000;
    let msg = ComptrollerErrorCodes[comptrollerResponse];

    if (msg === 'BORROW_BELOW_MIN') {
      msg = `As part of our guarded launch, you cannot borrow ${
        config.minBorrowUsd ? `less than ${config.minBorrowUsd}$ worth` : 'this amount'
      } of tokens at the moment.`;
    }

    // This is a comptroller error:
    err = new Error('Comptroller Error: ' + msg);
  } else {
    // This is a standard token error:
    err = new Error('CToken Code: ' + CTokenErrorCodes[errorCode]);
  }

  throw err;
}
