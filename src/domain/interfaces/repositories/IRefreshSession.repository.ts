export interface IRefreshSessionRepository {
  create(input: {
    sessionId: string;
    userId: string;
    tokenId: string;
    expiresAt: Date;
  }): Promise<void>;

  rotate(input: {
    sessionId: string;
    userId: string;
    currentTokenId: string;
    newTokenId: string;
    newExpiresAt: Date;
  }): Promise<boolean>;

  revoke(sessionId: string): Promise<void>;

  revokeAllByUserId(userId: string): Promise<void>;
}
