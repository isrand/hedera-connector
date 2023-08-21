import {IKyberKeyPair} from '../../crypto/interfaces/IKyberKeyPair';

export interface IAccount {
  hederaAccountId: string;
  hederaPublicKey: string;
  hederaPrivateKey: string;
  kyberKeys: Array<IKyberKeyPair>;
}
