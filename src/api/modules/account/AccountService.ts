import {Injectable, Logger} from '@nestjs/common';
import {HederaStub} from '../../../hedera/stub/HederaStub';
import {Crypto} from '../../../crypto/Crypto';
import {IHederaCreateAccountResponse} from './interfaces/IHederaCreateAccountResponse';
import {CreateAccountDTO} from './dto/CreateAccountDTO';
import {Wallet} from '../../../wallet/Wallet';
import {CreateAccountResponse} from './responses/CreateAccountResponse';
import {Account} from '../../../wallet/support/Account';
import {Configuration} from '../../../configuration/Configuration';
import {GetAllAccountsResponse} from './responses/GetAllAccountsResponse';
import {IRedactedAccount} from './interfaces/IRedactedAccount';
import {GetAccountResponse} from './responses/GetAccountResponse';

@Injectable()
export class AccountService {
  private readonly logger: Logger = new Logger(AccountService.name);

  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public async createAccount(createAccountDTO: CreateAccountDTO): Promise<CreateAccountResponse> {
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

    const createAccountResponse: IHederaCreateAccountResponse = await new HederaStub(
      account
    ).createAccount(createAccountDTO.initialBalance);

    const newAccount: Account = new Account(
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
    );

    await Wallet.storeAccount(newAccount);

    return {
      hederaAccountId: newAccount.getHederaAccountId(),
      hederaPublicKey: newAccount.getHederaPublicKey(),
      kyber512PublicKey: Buffer.from(kyber512KeyPair[0]).toString('base64'),
      kyber768PublicKey: Buffer.from(kyber768KeyPair[0]).toString('base64'),
      kyber1024PublicKey: Buffer.from(kyber1024KeyPair[0]).toString('base64')
    };
  }

  public async getAllAccounts(): Promise<GetAllAccountsResponse> {
    const accounts: Array<Account> = await Wallet.getAllAccounts();
    const redactedAccounts: Array<IRedactedAccount> = [];

    for (const account of accounts) {
      const redactedAccount: IRedactedAccount = {
        hederaAccountId: account.getHederaAccountId(),
        hederaPublicKey: account.getHederaPublicKey(),
        kyber512PublicKey: account.getKyberKeyPair(512).publicKey,
        kyber768PublicKey: account.getKyberKeyPair(768).publicKey,
        kyber1024PublicKey: account.getKyberKeyPair(1024).publicKey
      };

      redactedAccounts.push(redactedAccount);
    }

    return {
      accounts: redactedAccounts
    };
  }

  public async getAccount(accountId: string): Promise<GetAccountResponse> {
    const account: Account = await Wallet.getAccount(accountId);

    return {
      account: {
        hederaAccountId: account.getHederaAccountId(),
        hederaPublicKey: account.getHederaPublicKey(),
        kyber512PublicKey: account.getKyberKeyPair(512).publicKey,
        kyber768PublicKey: account.getKyberKeyPair(768).publicKey,
        kyber1024PublicKey: account.getKyberKeyPair(1024).publicKey
      }
    };
  }
}
