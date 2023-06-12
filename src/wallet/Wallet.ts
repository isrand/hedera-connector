import {WalletType} from './enums/WalletType';
import {IWallet} from './interfaces/IWallet';
import {FileSystemWallet} from './FileSystemWallet';

export class Wallet {
  public static wallet: IWallet;

  public static initializeProvider(walletType: string): void {
    if (walletType === WalletType.FileSystem) {
      this.wallet = new FileSystemWallet();

      this.wallet.initialize();
    }
  }
}
