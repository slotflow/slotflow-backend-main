export interface ISignedUrlService {

    // saving the awss3 key with generated signed url
    save(key: string): Promise<string>;

    // returning the signed url based on the key
    get(key: string): Promise<string>;

    // deleting the signed url
    delete(key: string): Promise<boolean>;

    debugLogAllSignedUrls(): Promise<void>;

    cleanupInvalidSignedUrls(): Promise<void>;

};