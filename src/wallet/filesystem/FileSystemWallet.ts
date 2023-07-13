import * as fs from 'fs';
import {IAccount} from '../interfaces/IAccount';
import {IWallet} from '../interfaces/IWallet';
import {Logger} from '@nestjs/common';
import {FileSystemNodeCredentialsLoader} from './support/FileSystemNodeCredentialsLoader';
import {Account} from '../support/Account';

export class FileSystemWallet implements IWallet {
  private readonly logger: Logger = new Logger(FileSystemWallet.name);

  private readonly pathToFileSystemWalletDirectory: string = '/opt/wallet';

  public constructor() {
    this.logger.debug('Creating new file system wallet');
  }

  public async initializeNodeAccount(): Promise<Account> {
    return Promise.resolve(new FileSystemNodeCredentialsLoader().loadNodeAccountFromCredentials());
  }

  public async loadAccount(accountId: string): Promise<Account> {
    try {
      const accountAsObject = JSON.parse(fs.readFileSync(`${this.pathToFileSystemWalletDirectory}/${accountId}.json`).toString()) as IAccount;

      return Promise.resolve(new Account(
        accountAsObject.hederaAccountId,
        accountAsObject.hederaPublicKey,
        accountAsObject.hederaPrivateKey,
        accountAsObject.kyberKeys
      ));
    } catch (error: unknown) {
      throw new Error(`Account ${accountId} not found in the filesystem wallet.`);
    }
  }

  // eslint-disable-next-line  @typescript-eslint/prefer-readonly-parameter-types
  public async storeAccount(account: Account): Promise<void> {
    if (fs.existsSync(`${this.pathToFileSystemWalletDirectory}/${account.getHederaAccountId()}.json`)) {
      this.logger.debug(`Account ${account.getHederaAccountId()} already exists in the filesystem. Skipping storage...`);

      return Promise.resolve();
    }

    this.logger.debug('Writing Account to file');

    fs.writeFileSync(`${this.pathToFileSystemWalletDirectory}/${account.getHederaAccountId()}.json`, JSON.stringify(account.toObject()));

    this.logger.debug(`Written Account to ${this.pathToFileSystemWalletDirectory}/${account.getHederaAccountId()}.json`);

    return Promise.resolve();
  }

  public async loadAllAccounts(): Promise<Array<Account>> {
    const accountIds: Array<string> = fs.readdirSync(this.pathToFileSystemWalletDirectory);
    const accounts: Array<Account> = [];

    for (const accountId of accountIds) {
      accounts.push(await this.loadAccount(accountId.replace('.json', '')));
    }

    return accounts;
  }
}
