import {Injectable, Logger} from '@nestjs/common';
import {HederaStub} from '../../../hedera/stub/HederaStub';
import {IHederaTransactionResponse} from '../../../hedera/responses/interfaces/IHederaTransactionResponse';
import {IHederaNetworkResponse} from '../../../hedera/responses/interfaces/IHederaNetworkResponse';
import {HederaTransactionResponse} from '../../../hedera/responses/HederaTransactionResponse';
import {CreateUpdateAppendFileDTO} from './dtos/CreateUpdateAppendFileDTO';
import {Wallet} from '../../../wallet/Wallet';
import {Configuration} from '../../../configuration/Configuration';

@Injectable()
export class FileService {
  private readonly logger: Logger = new Logger(FileService.name);

  public async createPublicFile(createPublicFileDTO: Readonly<CreateUpdateAppendFileDTO>, accountId?: string): Promise<Readonly<IHederaNetworkResponse>> {
    this.logger.log(`Creating new public file with contents ${JSON.stringify(createPublicFileDTO.contents)}`);

    const account = accountId ? await Wallet.getAccount(accountId) : await Wallet.getAccount(Configuration.nodeHederaAccountId);

    const finalContents: string | undefined = this.stringifyContents(createPublicFileDTO.contents);
    const createPublicFileResponse: IHederaTransactionResponse = await new HederaStub(
      account
    ).createFile(finalContents !== '' ? finalContents : undefined);

    if (createPublicFileResponse.receipt.fileId) {
      this.logger.log(`Created new public file. File ID: ${createPublicFileResponse.receipt.fileId.toString()}`);
    }

    return new HederaTransactionResponse(createPublicFileResponse).parse();
  }

  public async updatePublicFile(fileId: string, createPublicFileDTO: Readonly<CreateUpdateAppendFileDTO>, accountId?: string): Promise<Readonly<IHederaNetworkResponse>> {
    this.logger.log(`Updating file ${fileId} with contents ${JSON.stringify(createPublicFileDTO.contents)}`);

    const account = accountId ? await Wallet.getAccount(accountId) : await Wallet.getAccount(Configuration.nodeHederaAccountId);
    const updatePublicFileResponse: IHederaTransactionResponse = await new HederaStub(
      account
    ).updateFile(fileId, this.stringifyContents(createPublicFileDTO.contents));

    this.logger.log(`Updated public file ${fileId}`);

    return new HederaTransactionResponse(updatePublicFileResponse).parse();
  }

  public async getPublicFileContents(fileId: string, accountId?: string): Promise<string> {
    this.logger.log(`Getting the contents of file ${fileId}`);

    const account = accountId ? await Wallet.getAccount(accountId) : await Wallet.getAccount(Configuration.nodeHederaAccountId);

    return await new HederaStub(
      account
    ).getFileContents(fileId);
  }

  public async appendToPublicFile(fileId: string, contents: string, accountId?: string): Promise<Readonly<IHederaNetworkResponse>> {
    this.logger.log(`Appending ${JSON.stringify(contents)} to file ${fileId}`);

    const account = accountId ? await Wallet.getAccount(accountId) : await Wallet.getAccount(Configuration.nodeHederaAccountId);
    const appendToPublicFileResponse: IHederaTransactionResponse = await new HederaStub(
      account
    ).appendToFile(fileId, contents);

    this.logger.log(`Appended ${JSON.stringify(contents)} to public file ${fileId}`);

    return new HederaTransactionResponse(appendToPublicFileResponse).parse();
  }

  public async deleteFile(fileId: string, accountId?: string): Promise<IHederaNetworkResponse> {
    this.logger.log(`Deleting file ${fileId}`);

    const account = accountId ? await Wallet.getAccount(accountId) : await Wallet.getAccount(Configuration.nodeHederaAccountId);
    const deleteFileResponse: IHederaTransactionResponse = await new HederaStub(
      account
    ).deleteFile(fileId);

    this.logger.log(`Deleted file ${fileId}`);

    return new HederaTransactionResponse(deleteFileResponse).parse();
  }

  private stringifyContents(contents: string | undefined): string | undefined {
    if (!contents) {
      return undefined;
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
