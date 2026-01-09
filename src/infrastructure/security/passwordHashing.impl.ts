import bcrypt from 'bcryptjs';
import { log } from '../../shared/logger/logger';
import { IPasswordHasher } from '../../domain/interfaces/security/IPasswordHasher';

export class PasswordHasherImpl implements IPasswordHasher{

  async hashPassword(password: string): Promise<string> {
    try{
      const salt = await bcrypt.genSalt(10);
      return await bcrypt.hash(password, salt);
    }catch(error){
      log.error("hashPassword failed : ",error as Error);
      throw error;
    };
  };

  async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    try{
      return await bcrypt.compare(plainPassword, hashedPassword);
    }catch(error){
      log.error("comparePassword failed : ",error as Error)
      throw error;
    };
  };

}
