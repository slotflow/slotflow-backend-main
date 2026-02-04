import { Provider } from "../../entities/provider.entity";

export interface IProviderRepository {

  create(provider: Provider): Promise<Provider>;

  update(provider: Provider): Promise<Provider>;

  findById(providerId: string): Promise<Provider | null>;

  findByEmail(email: string): Promise<Provider | null>;

  findByGoogleId(googleId: string): Promise<Provider | null>;

  findByVerificationToken(token: string): Promise<Provider | null>;

  count(today?: boolean): Promise<number>;

  findAll(page: number, limit: number): Promise<{ data: Array<Provider>, totalPages: number; currentPage: number; totalCount: number; }>;

}