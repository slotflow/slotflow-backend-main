export interface CreditAccountProps {
  _id: string;
  userId: string;
  balance: number;
  isActive: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}