type CONFIG = {
  minBorrowUsd: string;
};

const config: CONFIG = {
  minBorrowUsd: process.env.MIN_BORROW_USD || '',
};

export { config };
