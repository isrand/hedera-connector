import {WalletType} from './enums/WalletType';
import {IWallet} from './interfaces/IWallet';
import {FileSystemWallet} from './FileSystemWallet';
import {IKyberKeyPair} from './interfaces/IKyberKeyPair';

export class Wallet {
  private static wallet: IWallet;

  public static initialize(walletType: string): void {
    if (walletType === WalletType.FileSystem) {
      this.wallet = new FileSystemWallet();
    }
  }

  public static getHederaAccountId(): string {
    return this.wallet.nodeCredentials.hederaAccountId;
  }

  public static getHederaPublicKey(): string {
    return this.wallet.nodeCredentials.hederaPublicKey;
  }

  public static getHederaPrivateKey(): string {
    return this.wallet.nodeCredentials.hederaPrivateKey;
  }

  public static getKyberKeyPair(size: number): IKyberKeyPair {
    const keyPair = this.wallet.nodeCredentials.kyberKeys.find((element: Readonly<IKyberKeyPair>) => {
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
}
