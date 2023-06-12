import {Client, PrivateKey} from '@hashgraph/sdk';
import {ICredentials} from '../../wallet/interfaces/ICredentials';
import {IWallet} from '../../wallet/interfaces/IWallet';
import {IHederaClient} from './interfaces/IHederaClient';

/*
 *HederaClient is a class that wraps around the "Client" from the Hashgraph SDK
 *and contains more information about the account.
 */

// TODO: Implement fs wallet / KV wallet system
export class HederaClient implements IHederaClient {
  public readonly hederaPublicKey: string;
  public readonly hederaPrivateKey: string;
  public readonly hederaAccountId: string;
  public readonly client: Client;

  public constructor(wallet: Readonly<IWallet>) {
    const credentials: ICredentials = wallet.loadCredentials();

    this.hederaPublicKey = this.getPublicKey(credentials);
    this.hederaPrivateKey = this.getPrivateKey(credentials);
    this.hederaAccountId = this.getAccountId(credentials);
    this.client = this.getClient();
  }

  private getClient(): Client {
    return Client.forTestnet().setOperator(
      this.hederaAccountId,
      PrivateKey.fromString(this.hederaPrivateKey)
    );
  }

  private getPublicKey(account: Readonly<ICredentials>): string {
    return account.hederaPublicKey;
  }

  private getPrivateKey(account: Readonly<ICredentials>): string {
    return account.hederaPrivateKey;
  }

  private getAccountId(account: Readonly<ICredentials>): string {
    return account.hederaAccountId;
  }
}
