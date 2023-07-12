import { WalletType } from "../wallet/enums/WalletType";

export class Configuration {
  public static walletType: string = String(process.env['WALLET_TYPE']) || WalletType.FileSystem; // default to a filesystem wallet if the environment variable is not passed
}
