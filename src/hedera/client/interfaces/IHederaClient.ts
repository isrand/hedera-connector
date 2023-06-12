import {Client} from '@hashgraph/sdk';

export interface IHederaClient {
  hederaPublicKey: string;
  hederaPrivateKey: string;
  hederaAccountId: string;
  client: Client;
}
