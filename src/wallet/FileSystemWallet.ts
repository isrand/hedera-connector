import * as fs from 'fs';
import {ICredentials} from './interfaces/ICredentials';
import {IWallet} from './interfaces/IWallet';
import {Logger} from '@nestjs/common';
import {IKyberKeyPair} from './interfaces/IKyberKeyPair';
import {Crypto} from '../crypto/Crypto';

export class FileSystemWallet implements IWallet {
  private readonly logger: Logger = new Logger(FileSystemWallet.name);

  private readonly pathToCredentialsDirectory: string = '/opt/credentials';
  private readonly pathToFileSystemWalletDirectory: string = '/opt/wallet';

  public nodeCredentials: ICredentials;

  public constructor() {
    this.logger.debug('Creating new file system wallet');

    this.nodeCredentials = {
      hederaAccountId: this.loadHederaAccountId(),
      hederaPublicKey: this.loadHederaPublicKey(),
      hederaPrivateKey: this.loadHederaPrivateKey(),
      kyberKeys: this.loadKyberKeys()
    };

    this.writeNodeCredentialsToFile(this.nodeCredentials);
  }

  // eslint-disable-next-line  @typescript-eslint/prefer-readonly-parameter-types
  private writeNodeCredentialsToFile(credentials: ICredentials): void {
    this.logger.debug('Writing Node credentials to file');

    const accountId: string = credentials.hederaAccountId;
    const pathToCredentials = `${this.pathToFileSystemWalletDirectory}/${accountId}.json`;

    fs.writeFileSync(pathToCredentials, JSON.stringify(credentials));

    this.logger.debug(`Written Node credentials to ${pathToCredentials}`);
  }

  private loadHederaAccountId(): string {
    return fs.readFileSync(`${this.pathToCredentialsDirectory}/hedera_account_id`).toString();
  }

  private loadHederaPublicKey(): string {
    return fs.readFileSync(`${this.pathToCredentialsDirectory}/hedera_public_key`).toString();
  }

  private loadHederaPrivateKey(): string {
    return fs.readFileSync(`${this.pathToCredentialsDirectory}/hedera_private_key`).toString();
  }

  /* eslint-disable */
  private loadKyberKeys(): Array<IKyberKeyPair> {
    const keys: Array<IKyberKeyPair> = [];

    for (const size of [512, 768, 1024]) {
      this.logger.debug(`Loading Kyber private / public key pair of size ${size}`);
      const publicKey = fs.readFileSync(`${this.pathToCredentialsDirectory}/kyber_${size}_public_key`).toString();
      const privateKey = fs.readFileSync(`${this.pathToCredentialsDirectory}/kyber_${size}_private_key`).toString();

      if (publicKey === 'empty' || privateKey === 'empty') {
        this.logger.debug(`Kyber private / public key pair of size ${size} not found. Generating now..`);
        const keyPair = new Crypto(size).adapter.generateKeyPair();

        keys.push({
          size: size,
          publicKey: Buffer.from(keyPair[0]).toString('base64'),
          privateKey: Buffer.from(keyPair[1]).toString('base64')
        });

        continue;
      }

      keys.push({
        size: size,
        publicKey: publicKey,
        privateKey: privateKey
      });

      this.logger.debug(`Loaded Kyber private / public key pair of size ${size}`);

    }

    return keys;
  }
  /* eslint-enable */
}
