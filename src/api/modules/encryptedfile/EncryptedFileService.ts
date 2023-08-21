import {Injectable, Logger} from '@nestjs/common';
import {HederaStub} from '../../../hedera/stub/HederaStub';
import {IHederaTransactionResponse} from '../../../hedera/responses/interfaces/IHederaTransactionResponse';
import {IHederaNetworkResponse} from '../../../hedera/responses/interfaces/IHederaNetworkResponse';
import {HederaTransactionResponse} from '../../../hedera/responses/HederaTransactionResponse';
import {Wallet} from '../../../wallet/Wallet';
import {Configuration} from '../../../configuration/Configuration';
import {CreateEncryptedFileDTO} from './dto/CreateEncryptedFileDTO';
import {IEncryptedObject} from '../../../common/interfaces/IEncryptedObject';
import {IAccessListParticipant} from '../../../common/interfaces/IAccessListParticipant';
import {Kyber} from '../../../crypto/Kyber';
import {UpdateFileParticipantsDTO} from './dto/UpdateFileParticipantsDTO';
import * as lodash from 'lodash';

@Injectable()
export class EncryptedFileService {
  private readonly logger: Logger = new Logger(EncryptedFileService.name);

  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public async createEncryptedFile(createEncryptedFileDTO: Readonly<CreateEncryptedFileDTO>, accountId?: string): Promise<IHederaNetworkResponse> {
    this.logger.log(`Creating new encrypted file with contents ${JSON.stringify(createEncryptedFileDTO.contents)}`);

    const account = accountId ? await Wallet.getAccount(accountId) : await Wallet.getAccount(Configuration.nodeHederaAccountId);
    let fileAccessList: Array<IAccessListParticipant> = [
      {
        hederaPublicKey: account.getHederaPublicKey(),
        kyberPublicKey: account.getKyberKeyPair(createEncryptedFileDTO.encryptionSize).publicKey
      },
      ...createEncryptedFileDTO.accessList
    ];

    fileAccessList = fileAccessList.filter((value: Readonly<IAccessListParticipant>) => !(!value.kyberPublicKey || value.kyberPublicKey === '') && !(!value.hederaPublicKey || value.hederaPublicKey === ''));

    const finalContents: string = this.stringifyContents(createEncryptedFileDTO.contents);
    let encryptedFileContents: IEncryptedObject | string = '';

    if (finalContents !== '') {
      encryptedFileContents = new Kyber(createEncryptedFileDTO.encryptionSize).encryptData(fileAccessList, finalContents);
      encryptedFileContents = Buffer.from(JSON.stringify(encryptedFileContents)).toString('base64');
    }

    const createPublicFileResponse: IHederaTransactionResponse = await new HederaStub(
      account
    ).createFile(finalContents !== '' ? encryptedFileContents : undefined);

    if (createPublicFileResponse.receipt.fileId) {
      this.logger.log(`Created new encrypted file. File ID: ${createPublicFileResponse.receipt.fileId.toString()}`);
    }

    return new HederaTransactionResponse(createPublicFileResponse).parse();
  }

  public async getEncryptedFileContents(fileId: string, accountId?: string): Promise<string> {
    this.logger.log(`Getting the contents of file ${fileId}`);

    const account = accountId ? await Wallet.getAccount(accountId) : await Wallet.getAccount(Configuration.nodeHederaAccountId);

    const encryptedFileContents: string = await new HederaStub(
      account
    ).getFileContents(fileId);

    const encryptedFileObject: IEncryptedObject = JSON.parse(Buffer.from(encryptedFileContents, 'base64').toString('utf8')) as IEncryptedObject;

    return new Kyber(encryptedFileObject.s).decryptFile(encryptedFileObject, account.getKyberKeyPair(encryptedFileObject.s).privateKey);
  }

  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public async addParticipantsToEncryptedFile(fileId: string, accessList: UpdateFileParticipantsDTO, accountId?: string): Promise<IHederaNetworkResponse> {
    this.logger.log(`Adding participants ${accessList.participants} to access list of file ${fileId}`);

    const account = accountId ? await Wallet.getAccount(accountId) : await Wallet.getAccount(Configuration.nodeHederaAccountId);

    const encryptedFileContents: string = await new HederaStub(
      account
    ).getFileContents(fileId);

    const encryptedFileObject: IEncryptedObject = JSON.parse(Buffer.from(encryptedFileContents, 'base64').toString('utf8')) as IEncryptedObject;
    const decryptedFileContents: string = new Kyber(encryptedFileObject.s).decryptFile(encryptedFileObject, account.getKyberKeyPair(encryptedFileObject.s).privateKey);

    const newEncryptedFileObject = new Kyber(encryptedFileObject.s).encryptData(accessList.participants, decryptedFileContents);

    // eslint-disable
    // ESLint complains a lot with lodash, it seems...
    const fileCombinations: IEncryptedObject = lodash.merge<IEncryptedObject, IEncryptedObject>(encryptedFileObject, newEncryptedFileObject) as IEncryptedObject;
    // eslint-enable

    const fileCombinationsBase64 = Buffer.from(JSON.stringify(fileCombinations)).toString('base64');

    const updateEncryptedFileResponse: IHederaTransactionResponse = await new HederaStub(
      account
    ).updateFile(fileId, fileCombinationsBase64);

    return new HederaTransactionResponse(updateEncryptedFileResponse).parse();
  }

  public async deleteEncryptedFile(fileId: string, accountId?: string): Promise<IHederaNetworkResponse> {
    this.logger.log(`Deleting file ${fileId}`);

    const account = accountId ? await Wallet.getAccount(accountId) : await Wallet.getAccount(Configuration.nodeHederaAccountId);
    const deleteFileResponse: IHederaTransactionResponse = await new HederaStub(
      account
    ).deleteFile(fileId);

    this.logger.log(`Deleted file ${fileId}`);

    return new HederaTransactionResponse(deleteFileResponse).parse();
  }

  private stringifyContents(contents: string | undefined): string {
    if (!contents) {
      return '';
    }

    let finalContents: string;

    if (typeof contents === 'object') {
      finalContents = JSON.stringify(contents);
    } else {
      finalContents = contents;
    }

    return finalContents;
  }
}
