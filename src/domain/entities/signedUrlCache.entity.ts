export class SignedUrlCache {
    constructor(
        public key: string,
        public url: string,
        public expiresAt: Date
    ) {}
}