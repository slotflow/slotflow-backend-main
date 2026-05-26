import { googlePassportStrategy } from '../../infrastructure/passport';

export const initPassport = () => {
  googlePassportStrategy.register();
};