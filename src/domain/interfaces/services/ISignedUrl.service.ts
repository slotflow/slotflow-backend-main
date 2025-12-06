export interface ISignedUrlService {

    generate(key: string, expires?: number): Promise<string>;
    
}