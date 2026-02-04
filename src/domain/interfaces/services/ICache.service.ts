export interface ICacheService {

    setBlockList(key: string, value: string): Promise<void>;

    getBlockList(key: string): Promise<string | null>;

    deleteBlockList(key: string): Promise<void>;
    
};