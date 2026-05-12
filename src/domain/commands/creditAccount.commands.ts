export type CreateCreditAccountProps = {
  userId: string;
};

export type UpdateCreditAccountBalanceProps = {
  balance: number;
  version: number;
};

export type DeactivateCreditAccountProps = {
  version: number;
};
