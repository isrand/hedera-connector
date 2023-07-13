import {WalletType} from './enums/WalletType';
import {IWallet} from './interfaces/IWallet';
import {FileSystemWallet} from './filesystem/FileSystemWallet';
import {Account} from './support/Account';
import {Logger} from '@nestjs/common';

export class Wallet {
  private static readonly logger: Logger = new Logger(Wallet.name);
  private static readonly accounts: Map<string, Account> = new Map();
  private static walletProvider: IWallet;

  public static async initialize(walletType: string): Promise<void> {
    if (walletType === WalletType.FileSystem) {
      this.walletProvider = new FileSystemWallet();
    }

    await this.initializeNodeAccount();
    await this.loadExistingAccounts();
  }

  public static async getAccount(accountId: string): Promise<Account> {
    this.logger.log(`Loading account ${accountId}`);

    let account: Account | undefined = this.accounts.get(accountId);

    if (!account) {
      account = await this.walletProvider.loadAccount(accountId);
      this.accounts.set(accountId, account);
    }

    this.logger.log(`Loaded account ${accountId}`);

    return Promise.resolve(account);
  }

  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public static async storeAccount(account: Account): Promise<void> {
    await this.walletProvider.storeAccount(account);
  }

  public static async initializeNodeAccount(): Promise<void> {
    const nodeAccount = await this.walletProvider.initializeNodeAccount();
    this.accounts.set(nodeAccount.getHederaAccountId(), nodeAccount);

    await this.walletProvider.storeAccount(nodeAccount);
  }

  public static async loadExistingAccounts(): Promise<void> {
    this.logger.debug('Loading all existing accounts');

    const accounts: Array<Account> = await this.getAllAccounts();

    for (const account of accounts) {
      if (!this.accounts.has(account.getHederaAccountId())) {
        this.logger.debug(`Loaded account ${account.getHederaAccountId()}`);
        this.accounts.set(account.getHederaAccountId(), account);
      }
    }

    return Promise.resolve();
  }

  public static async getAllAccounts(): Promise<Array<Account>> {
    return await this.walletProvider.loadAllAccounts();
  }
}
