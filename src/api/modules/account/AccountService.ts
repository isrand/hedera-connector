import {Injectable, Logger, NotFoundException, PreconditionFailedException} from '@nestjs/common';
import {HederaStub} from '../../../hedera/stub/HederaStub';
import {Crypto} from '../../../crypto/Crypto';
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

@Injectable()
export class AccountService {
  private readonly logger: Logger = new Logger(AccountService.name);

  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public async createAccount(createAccountRequest: CreateAccountRequest): Promise<HederaConnectorCreateAccountResponse> {
    const account = await Wallet.getAccount(Configuration.nodeHederaAccountId);

    this.logger.debug('Creating new Hedera account and associated Kyber keys...');

    /* eslint-disable */
    const kyber512KeyPair: Array<Array<number>> = new Crypto(512).adapter.generateKeyPair();

    if (!kyber512KeyPair[0] || !kyber512KeyPair[1]) {
      throw new Error('Error generating Kyber key pair for size 512');
    }

    const kyber768KeyPair: Array<Array<number>> = new Crypto(768).adapter.generateKeyPair();

    if (!kyber768KeyPair[0] || !kyber768KeyPair[1]) {
      throw new Error('Error generating Kyber key pair for size 768');
    }

    const kyber1024KeyPair: Array<Array<number>> = new Crypto(1024).adapter.generateKeyPair();

    if (!kyber1024KeyPair[0] || !kyber1024KeyPair[1]) {
      throw new Error('Error generating Kyber key pair for size 1024');
    }

    /* eslint-enable */
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
          size: 512,
          publicKey: Buffer.from(kyber512KeyPair[0]).toString('base64'),
          privateKey: Buffer.from(kyber512KeyPair[1]).toString('base64')
        },
        {
          size: 768,
          publicKey: Buffer.from(kyber768KeyPair[0]).toString('base64'),
          privateKey: Buffer.from(kyber768KeyPair[1]).toString('base64')
        },
        {
          size: 1024,
          publicKey: Buffer.from(kyber1024KeyPair[0]).toString('base64'),
          privateKey: Buffer.from(kyber1024KeyPair[1]).toString('base64')
        }
      ]
    ));

    return {
      statusCode: HttpStatusCode.Created,
      message: 'Account created.',
      payload: {
        hederaAccountId: createAccountResponse.hederaAccountId,
        hederaPublicKey: createAccountResponse.hederaPublicKey,
        kyber512PublicKey: Buffer.from(kyber512KeyPair[0]).toString('base64'),
        kyber768PublicKey: Buffer.from(kyber768KeyPair[0]).toString('base64'),
        kyber1024PublicKey: Buffer.from(kyber1024KeyPair[0]).toString('base64')
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
