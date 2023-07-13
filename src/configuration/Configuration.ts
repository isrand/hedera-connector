import {WalletType} from '../wallet/enums/WalletType';

export class Configuration {
  public static nodeHederaAccountId: string = String(process.env['NODE_HEDERA_ACCOUNT_ID']) || '';
  public static walletType: string = String(process.env['WALLET_TYPE']) || WalletType.FileSystem; // default to a filesystem wallet if the environment variable is not passed

  public static couchDBURL: string = String(process.env['COUCHDB_URL']);
  public static couchDBUser: string = String(process.env['COUCHDB_USER']);
  public static couchDBPassword: string = String(process.env['COUCHDB_PASSWORD']);
}
