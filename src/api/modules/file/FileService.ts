import {Injectable, Logger} from '@nestjs/common';
import {HederaStub} from '../../../hedera/stub/HederaStub';
import {IHederaTransactionResponse} from '../../../hedera/responses/interfaces/IHederaTransactionResponse';
import {IHederaConnectorResponse} from '../../responses/IHederaConnectorResponse';
import {HederaTransactionResponse} from '../../../hedera/responses/HederaTransactionResponse';
import {CreateUpdateAppendFileDTO} from './dtos/CreateUpdateAppendFileDTO';

@Injectable()
export class FileService {
  private readonly logger: Logger = new Logger(FileService.name);
  private readonly hederaStub: HederaStub;

  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public constructor() {
    this.hederaStub = new HederaStub();
  }

  public async createPublicFile(createPublicFileDTO: Readonly<CreateUpdateAppendFileDTO>): Promise<Readonly<IHederaConnectorResponse>> {
    this.logger.log(`Creating new public file with contents ${JSON.stringify(createPublicFileDTO.contents)}`);

    const finalContents: string | undefined = this.stringifyContents(createPublicFileDTO.contents);
    const createPublicFileResponse: IHederaTransactionResponse = await this.hederaStub.createFile(finalContents !== '' ? finalContents : undefined);

    if (createPublicFileResponse.receipt.fileId) {
      this.logger.log(`Created new public file. File ID: ${createPublicFileResponse.receipt.fileId.toString()}`);
    }

    return new HederaTransactionResponse(createPublicFileResponse).parse();
  }

  public async updatePublicFile(fileId: string, createPublicFileDTO: Readonly<CreateUpdateAppendFileDTO>): Promise<Readonly<IHederaConnectorResponse>> {
    this.logger.log(`Updating file ${fileId} with contents ${JSON.stringify(createPublicFileDTO.contents)}`);

    const updatePublicFileResponse: IHederaTransactionResponse = await this.hederaStub.updateFile(fileId, this.stringifyContents(createPublicFileDTO.contents));

    this.logger.log(`Updated public file ${fileId}`);

    return new HederaTransactionResponse(updatePublicFileResponse).parse();
  }

  public async getPublicFileContents(fileId: string): Promise<string> {
    this.logger.log(`Getting the contents of file ${fileId}`);

    return await this.hederaStub.getFileContents(fileId);
  }

  public async appendToPublicFile(fileId: string, contents: string): Promise<Readonly<IHederaConnectorResponse>> {
    this.logger.log(`Appending ${JSON.stringify(contents)} to file ${fileId}`);

    const appendToPublicFileResponse: IHederaTransactionResponse = await this.hederaStub.appendToFile(fileId, contents);

    this.logger.log(`Appended ${JSON.stringify(contents)} to public file ${fileId}`);

    return new HederaTransactionResponse(appendToPublicFileResponse).parse();
  }

  public async deleteFile(fileId: string): Promise<IHederaConnectorResponse> {
    this.logger.log(`Deleting file ${fileId}`);

    const deleteFileResponse: IHederaTransactionResponse = await this.hederaStub.deleteFile(fileId);

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
