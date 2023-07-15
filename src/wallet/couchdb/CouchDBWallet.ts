import {IWallet} from '../interfaces/IWallet';
import {Account} from '../support/Account';
import {NodeCredentials} from '../common/NodeCredentials';
import {Logger} from '@nestjs/common';
import {CouchDBAdapter} from './support/CouchDBAdapter';
import {Configuration} from '../../configuration/Configuration';
import {IAccount} from '../interfaces/IAccount';
import * as nano from 'nano';

export class CouchDBWallet implements IWallet {
  private readonly logger: Logger = new Logger(CouchDBWallet.name);

  private readonly accountCollectionName: string = 'accounts';
  private readonly couchDBAdapter: CouchDBAdapter;

  public constructor() {
    this.logger.debug('Creating new CouchDB wallet');
    this.couchDBAdapter = new CouchDBAdapter(
      Configuration.couchDBURL,
      Configuration.couchDBUser,
      Configuration.couchDBPassword
    );
  }

  public async initializeNodeAccount(): Promise<Account> {
    await this.initializeAccountsCollection();

    return Promise.resolve(new NodeCredentials().loadNodeAccount());
  }

  public async loadAccount(accountId: string): Promise<Account> {
    try {
      const databaseResponse: IAccount = await this.couchDBAdapter.getFromCollectionById(this.accountCollectionName, accountId) as unknown as IAccount;

      return new Account(
        databaseResponse.hederaAccountId,
        databaseResponse.hederaPublicKey,
        databaseResponse.hederaPrivateKey,
        databaseResponse.kyberKeys
      );
    } catch (error: unknown) {
      throw new Error(`Account ${accountId} not found in the database.`);
    }
  }

  public async loadAllAccounts(): Promise<Array<Account>> {
    const accounts: Array<Account> = [];

    const accountsInDatabase: nano.DocumentListResponse<unknown> = await this.couchDBAdapter.getAllFromCollection(this.accountCollectionName);

    for (const accountDocument of accountsInDatabase.rows) {
      const castedAccount = accountDocument.doc as unknown as IAccount;
      accounts.push(new Account(
        castedAccount.hederaAccountId,
        castedAccount.hederaPublicKey,
        castedAccount.hederaPrivateKey,
        castedAccount.kyberKeys
      ));
    }

    return accounts;
  }

  // eslint-disable-next-line  @typescript-eslint/prefer-readonly-parameter-types
  public async storeAccount(account: Account): Promise<void> {
    if (await this.couchDBAdapter.documentExists(this.accountCollectionName, account.getHederaAccountId())) {
      return;
    }

    this.logger.debug(`Writing Account ${account.getHederaAccountId()} to database`);

    const accountObject: IAccount = account.toObject();
    const accountDocument: IAccount & nano.IdentifiedDocument = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      _id: accountObject.hederaAccountId,
      hederaAccountId: accountObject.hederaAccountId,
      hederaPublicKey: accountObject.hederaPublicKey,
      hederaPrivateKey: accountObject.hederaPrivateKey,
      kyberKeys: accountObject.kyberKeys
    };

    await this.couchDBAdapter.storeInCollection(this.accountCollectionName, accountDocument);

    this.logger.debug(`Written Account ${account.getHederaAccountId()} to database`);
  }

  private async initializeAccountsCollection(): Promise<void> {
    if (!await this.couchDBAdapter.collectionExists(this.accountCollectionName)) {
      await this.couchDBAdapter.createCollection(this.accountCollectionName);
    }
  }
}
