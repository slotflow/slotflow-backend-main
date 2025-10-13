import { Producer } from 'kafkajs';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../domain/entities/user.entity';
import { Role } from '../../infrastructure/dtos/common.dto';
import { JWTService } from '../../infrastructure/security/jwt';
import { Provider } from '../../domain/entities/provider.entity';
import { OTPService } from '../../infrastructure/services/otp.service';
import { validateOrThrow } from '../../infrastructure/validator/validator';
import { KafkaProducerService } from '../../infrastructure/lib/kafka.producer';
import { PasswordHasher } from '../../infrastructure/security/password-hashing';
import { RegisterRequest, RegisterResponse } from '../../infrastructure/dtos/auth.dto';
import { UserRepositoryImpl } from '../../infrastructure/database/user/user.repository.impl';
import { ProviderRepositoryImpl } from '../../infrastructure/database/provider/provider.repository.impl';


export class RegisterUseCase {

  constructor(
    private userRepositoryImpl: UserRepositoryImpl, 
    private providerRepositoryImpl: ProviderRepositoryImpl,
    private kafkaProducerService: KafkaProducerService
  ) { }

  async execute(data: RegisterRequest): Promise<RegisterResponse> {
    const { username, email, password, role } = data;
    if (!username || !email || !password || !role) throw new Error("Invalid request");

    const producer: Producer = this.kafkaProducerService.getProducer();

    validateOrThrow("username", username);
    validateOrThrow("email", email);
    validateOrThrow("password", password);
    validateOrThrow("role", role);

    let userOrProvider: Partial<Provider> | Partial<User> | null;

    if (role === Role.user) {
      userOrProvider = await this.userRepositoryImpl.findUserByEmail(email);
      if (userOrProvider?.isEmailVerified) throw new Error("Email already exist.");
    } else if (role === Role.provider) {
      userOrProvider = await this.providerRepositoryImpl.findProviderByEmail(email);
      if (userOrProvider?.isEmailVerified) throw new Error("Email already exist.");
    } else {
      throw new Error("Invalid request.");
    }

    const hashedPassword = await PasswordHasher.hashPassword(password);

    const verificationToken = uuidv4();
    if (!verificationToken) throw new Error("Unexpected error, please try again.");

    const otp = await OTPService.setOtp(verificationToken);
    if (!otp) throw new Error("Unexpected error, please try again.");

    await OTPService.sendOTP(email, otp);

    const producerResult = await producer.send({
      topic: "sendOtp-events",
      messages: [
        {
          key: email,
          value: JSON.stringify({ email, otp })
        }
      ]
    });

    if (!producerResult || producerResult.length === 0) {
      throw new Error("OTP sending failed: no record metadata returned");
    }

    if (userOrProvider) {
      userOrProvider.verificationToken = verificationToken;
      userOrProvider.password = hashedPassword;
      if (role === Role.user) {
        await this.userRepositoryImpl.updateUser(userOrProvider as User);
      } else if (role === Role.provider) {
        await this.providerRepositoryImpl.updateProvider(userOrProvider as Provider);
      }
    } else {
      if (role === Role.user) {
        await this.userRepositoryImpl.createUser({
          username: username,
          email: email,
          password: hashedPassword,
          verificationToken: verificationToken,
        });
      } else if (role === Role.provider) {
        await this.providerRepositoryImpl.createProvider({
          username: username,
          email: email,
          password: hashedPassword,
          verificationToken: verificationToken
        });
      }
    }

    const token = JWTService.generateToken({ email, role });

    return { success: true, message: `OTP sent to email`, authUser: { verificationToken, role, token } };
  }
}
