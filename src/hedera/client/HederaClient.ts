import {Client, PrivateKey} from '@hashgraph/sdk';
import {IHederaClient} from './interfaces/IHederaClient';
import {Wallet} from '../../wallet/Wallet';

/*
 *HederaClient is a class that wraps around the "Client" from the Hashgraph SDK
 *and contains more information about the account.
 */

// TODO: Implement fs wallet / KV wallet system
export class HederaClient implements IHederaClient {
  public readonly client: Client;

  public constructor() {
    this.client = Client.forTestnet().setOperator(
      Wallet.getHederaAccountId(),
      PrivateKey.fromString(Wallet.getHederaPrivateKey())
    );
  }
}
