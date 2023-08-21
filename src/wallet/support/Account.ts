import {IKyberKeyPair} from '../../crypto/interfaces/IKyberKeyPair';
import {IAccount} from '../interfaces/IAccount';

export class Account {
  public constructor(
    private readonly hederaAccountId: string,
    private readonly hederaPublicKey: string,
    private readonly hederaPrivateKey: string,
    // eslint-disable-next-line  @typescript-eslint/prefer-readonly-parameter-types
    private readonly kyberKeys: Array<IKyberKeyPair>
  ) {
  }

  public getHederaAccountId(): string {
    return this.hederaAccountId;
  }

  public getHederaPublicKey(): string {
    return this.hederaPublicKey;
  }

  public getHederaPrivateKey(): string {
    return this.hederaPrivateKey;
  }

  public getKyberKeyPair(size: number): IKyberKeyPair {
    const keyPair = this.kyberKeys.find((element: Readonly<IKyberKeyPair>) => {
      return element.size === size;
    });

    if (!keyPair) {
      return {
        size: 512,
        publicKey: '',
        privateKey: ''
      };
    }

    return keyPair;
  }

  public toObject(): IAccount {
    return {
      hederaAccountId: this.hederaAccountId,
      hederaPublicKey: this.hederaPublicKey,
      hederaPrivateKey: this.hederaPrivateKey,
      kyberKeys: this.kyberKeys
    };
  }
}
