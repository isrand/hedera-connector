import {IKyberKeyPair} from './IKyberKeyPair';

export interface IAccount {
  hederaAccountId: string;
  hederaPublicKey: string;
  hederaPrivateKey: string;
  kyberKeys: Array<IKyberKeyPair>;
}
