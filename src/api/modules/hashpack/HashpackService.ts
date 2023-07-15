import {HashConnectTypes} from 'hashconnect/dist/cjs/types/hashconnect';
import {HashConnect} from 'hashconnect/dist/cjs/main';

export class HashpackService {
  public async pairWithWallet(): Promise<Array<string>> {
    const appMetadata: HashConnectTypes.AppMetadata = {
      url: 'test',
      name: 'Hedera Connector',
      description: 'A REST API Microservice to perform transactions with the Hedera network easily. ',
      icon: 'https://cryptologos.cc/logos/hedera-hbar-logo.png'
    };

    const hashconnect = new HashConnect(true);
    const initData = await hashconnect.init(appMetadata, 'testnet', false);
    await hashconnect.clearConnectionsAndData();

    return [initData.pairingString, initData.topic];
  }
}
