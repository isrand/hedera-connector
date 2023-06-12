import * as fs from 'fs';
import {ICredentials} from './interfaces/ICredentials';
import {IWallet} from './interfaces/IWallet';
import {Logger} from '@nestjs/common';
import {Configuration} from '../configuration/Configuration';

export class FileSystemWallet implements IWallet {
  private readonly logger: Logger = new Logger(FileSystemWallet.name);

  public initialize(): void {
    this.logger.debug('Creating new file system wallet');

    this.writeNodeCredentialsToFile();
  }

  public getNodeCredentials(): ICredentials {
    return {
      hederaAccountId: Configuration.hederaAccountId,
      hederaPublicKey: Configuration.hederaPublicKey,
      hederaPrivateKey: Configuration.hederaPrivateKey,
      kyberPrivateKey: Configuration.kyberPrivateKey,
      kyberPublicKey: Configuration.kyberPublicKey
    };
  }

  public writeNodeCredentialsToFile(): void {
    this.logger.debug('Writing Node credentials to file');

    const credentials: ICredentials = this.getNodeCredentials();
    const accountId: string = credentials.hederaAccountId;
    const pathToCredentials = `/opt/wallet/${accountId}.json`;

    fs.writeFileSync(pathToCredentials, JSON.stringify(credentials));

    this.logger.debug(`Written Node credentials to ${pathToCredentials}`);
  }

  public loadCredentials(accountId?: string): ICredentials {
    if (accountId) {
      const pathToCredentials = `/opt/wallet/${accountId}.json`;
      this.logger.debug(`Loading Hedera account found in ${pathToCredentials}`);

      return JSON.parse(
        fs.readFileSync(pathToCredentials).toString()
      ) as ICredentials;
    }

    const nodeAccountId: string = Configuration.hederaAccountId;
    const pathToCredentials = `/opt/wallet/${nodeAccountId}.json`;

    this.logger.debug(`Loading Node Hedera account found in ${pathToCredentials}`);

    return JSON.parse(
      fs.readFileSync(pathToCredentials).toString()
    ) as ICredentials;
  }
}
