import {IKyberKeyPair} from './IKyberKeyPair';

export interface ICredentials {
  hederaAccountId: string;
  hederaPublicKey: string;
  hederaPrivateKey: string;
  kyberKeys: Array<IKyberKeyPair>;
}
