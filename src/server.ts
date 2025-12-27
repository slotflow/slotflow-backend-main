import app from './app';
import dotenv from 'dotenv';

import './infrastructure/services/passportService.impl.ts';
import './infrastructure/cron-jobs/updateBookingsCron';
import './infrastructure/cron-jobs/updateSubscriptionStatusCron';

const userRepo = new UserRepositoryImpl();
const providerRepo = new ProviderRepositoryImpl();
const googleAuthUseCase = new GoogleAuthUseCase(userRepo, providerRepo);
const orchestrator = new GoogleAuthOrchestratorUseCase(googleAuthUseCase, userRepo, providerRepo);
new GooglePassportStrategyImpl(orchestrator).register();

// import { kafkaConfig } from './config/env';
// import { KafkaService } from './infrastructure/lib/kafka';

import connectDB from './config/database/mongodb/mongodb.config';
import { UserRepositoryImpl } from './infrastructure/database/user/user.repository.impl.ts';
import { ProviderRepositoryImpl } from './infrastructure/database/provider/provider.repository.impl.ts';
import { GoogleAuthUseCase } from './application/useCases/auth/googleAuth.useCase.ts';
import { GoogleAuthOrchestratorUseCase } from './application/useCases/auth/googleAuthOrchestrate.useCase.ts';
import { GooglePassportStrategyImpl } from './infrastructure/passport/google.strategy.ts';

dotenv.config();

// const kafkaService = new KafkaService(kafkaConfig.clientId!, kafkaConfig.brokers);

// await kafkaService.connectAdmin();
// await kafkaService.createTopics([kafkaConfig.otpSendTopic]);
// await kafkaService.disconnectAdmin();
// await kafkaService.connectProducer();

// export const producer = kafkaService.getProducer();

const port = process.env.PORT || 4000;

connectDB();

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})