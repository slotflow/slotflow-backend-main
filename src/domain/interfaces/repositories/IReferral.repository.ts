import { ClientSession } from 'mongoose';
import { Referral } from '../../entities/referral.entity';
import { ReferralStatus } from '../../enums/common.enum';
import { TableData } from '../../../application/dtos/common.dto';

export interface IReferralRepository {
    create(referral: Referral, session?: ClientSession): Promise<Referral | null>;

    findById(id: string): Promise<Referral | null>;

    findByCode(code: string): Promise<Referral | null>;

    findByUserId(page: number, limit: number, referrerUserId?: string, status?: ReferralStatus): Promise<TableData<Array<Referral>>>;

    update(referral: Referral, session?: ClientSession): Promise<Referral | null>;

    delete(id: string): Promise<boolean>;

    findByReferrerAndReferredUser(referrerUserId: string, refereeUserId: string): Promise<Referral | null>;
}
