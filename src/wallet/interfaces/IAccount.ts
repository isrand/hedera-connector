import {IKyberKeyPair} from '../../crypto/adapters/kyber/interfaces/IKyberKeyPair';

export interface IAccount {
  hederaAccountId: string;
  hederaPublicKey: string;
  hederaPrivateKey: string;
  kyberKeys: Array<IKyberKeyPair>;
}
