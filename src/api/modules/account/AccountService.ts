import {Injectable, Logger, NotFoundException, PreconditionFailedException} from '@nestjs/common';
import {HederaStub} from '../../../hedera/stub/HederaStub';
import {IHederaCreateAccountResponse} from '../../../hedera/responses/interfaces/IHederaCreateAccountResponse';
import {CreateAccountRequest} from './requests/CreateAccountRequest';
import {Wallet} from '../../../wallet/Wallet';
import {HederaConnectorCreateAccountResponse} from './responses/CreateAccountResponse';
import {Account} from '../../../wallet/support/Account';
import {Configuration} from '../../../configuration/Configuration';
import {HederaConnectorGetAllAccountsResponse} from './responses/GetAllAccountsResponse';
import {HederaConnectorGetAccountResponse} from './responses/GetAccountResponse';
import {HttpStatusCode} from 'axios';
import {AccountResponse} from './responses/AccountResponse';
import {KeySize} from '../../../crypto/enums/KeySize';
import {KyberKeyPair} from '../../../crypto/support/KyberKeyPair';
import {Kyber} from '../../../crypto/Kyber';

@Injectable()
export class AccountService {
  private readonly logger: Logger = new Logger(AccountService.name);

  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public async createAccount(createAccountRequest: CreateAccountRequest): Promise<HederaConnectorCreateAccountResponse> {
    const account = await Wallet.getAccount(Configuration.nodeHederaAccountId);

    this.logger.debug('Creating new Hedera account and associated Kyber keys...');

    const kyber512KeyPair: KyberKeyPair = new Kyber(KeySize.Kyber512).generateKeyPair();
    const kyber768KeyPair: KyberKeyPair = new Kyber(KeySize.Kyber768).generateKeyPair();
    const kyber1024KeyPair: KyberKeyPair = new Kyber(KeySize.Kyber1024).generateKeyPair();

    let createAccountResponse: IHederaCreateAccountResponse;

    try {
      createAccountResponse = await new HederaStub(
        account
      ).createAccount(createAccountRequest.initialBalance);
    } catch (error: unknown) {
      this.logger.error(error);

      throw new PreconditionFailedException('Node account does not have enough balance to create new account.');
    }

    await Wallet.storeAccount(new Account(
      createAccountResponse.hederaAccountId,
      createAccountResponse.hederaPublicKey,
      createAccountResponse.hederaPrivateKey,
      [
        {
          size: KeySize.Kyber512,
          publicKey: kyber512KeyPair.publicKey,
          privateKey: kyber512KeyPair.privateKey
        },
        {
          size: KeySize.Kyber768,
          publicKey: kyber768KeyPair.publicKey,
          privateKey: kyber768KeyPair.privateKey
        },
        {
          size: KeySize.Kyber1024,
          publicKey: kyber1024KeyPair.publicKey,
          privateKey: kyber1024KeyPair.privateKey
        }
      ]
    ));

    return {
      statusCode: HttpStatusCode.Created,
      message: 'Account created.',
      payload: {
        hederaAccountId: createAccountResponse.hederaAccountId,
        hederaPublicKey: createAccountResponse.hederaPublicKey,
        kyber512PublicKey: kyber512KeyPair.publicKey,
        kyber768PublicKey: kyber768KeyPair.publicKey,
        kyber1024PublicKey: kyber1024KeyPair.publicKey
      }
    };
  }

  public async getAllAccounts(): Promise<HederaConnectorGetAllAccountsResponse> {
    const accountsInWallet: Array<Account> = await Wallet.getAllAccounts();
    const accounts: Array<AccountResponse> = [];

    for (const account of accountsInWallet) {
      accounts.push({
        hederaAccountId: account.getHederaAccountId(),
        hederaPublicKey: account.getHederaPublicKey(),
        kyber512PublicKey: account.getKyberKeyPair(512).publicKey,
        kyber768PublicKey: account.getKyberKeyPair(768).publicKey,
        kyber1024PublicKey: account.getKyberKeyPair(1024).publicKey
      });
    }

    return {
      statusCode: HttpStatusCode.Ok,
      message: 'Accounts retrieved.',
      payload: {
        accounts: accounts
      }
    };
  }

  public async getAccount(accountId: string): Promise<HederaConnectorGetAccountResponse> {
    let account: Account;

    try {
      account = await Wallet.getAccount(accountId);
    } catch (error: unknown) {
      this.logger.error(error);

      throw new NotFoundException('Account not found in node wallet.');
    }

    return {
      statusCode: HttpStatusCode.Ok,
      message: 'Account retrieved.',
      payload: {
        hederaAccountId: account.getHederaAccountId(),
        hederaPublicKey: account.getHederaPublicKey(),
        kyber512PublicKey: account.getKyberKeyPair(512).publicKey,
        kyber768PublicKey: account.getKyberKeyPair(768).publicKey,
        kyber1024PublicKey: account.getKyberKeyPair(1024).publicKey
      }
    };
  }
}
