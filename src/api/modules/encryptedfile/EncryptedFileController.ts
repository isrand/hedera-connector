import {ApiOperation, ApiQuery, ApiTags} from '@nestjs/swagger';
import {Body, Controller, Delete, Get, Param, Post, Put, Query} from '@nestjs/common';
import {Configuration} from '../../../configuration/Configuration';
import {IHederaNetworkResponse} from '../../../hedera/responses/interfaces/IHederaNetworkResponse';
import {CreateEncryptedFileDTO} from './dto/CreateEncryptedFileDTO';
import {EncryptedFileService} from './EncryptedFileService';
import {UpdateFileParticipantsDTO} from './dto/UpdateFileParticipantsDTO';

@ApiTags('Encrypted File')
@Controller()
export class EncryptedFileController {
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public constructor(private readonly encryptedFileService: EncryptedFileService) {
  }

  @ApiOperation({
    summary: 'Create a new encrypted file.',
    description: `This endpoint creates a new encrypted file on the Hedera network.
The endpoint accepts a request body with the contents of the file, but can also be ran with an empty "contents" key. This will create an empty file, to which data can be appended later, or updated as a whole.`
  })
  @ApiQuery({
    name: 'accountId',
    type: String,
    description: 'Account performing this operation.',
    required: false,
    example: Configuration.nodeHederaAccountId
  })
  @Post('/encryptedfile')
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public async createEncryptedFile(@Body() createEncryptedFileDTO: CreateEncryptedFileDTO, @Query('accountId') accountId?: string): Promise<IHederaNetworkResponse> {
    return await this.encryptedFileService.createEncryptedFile(createEncryptedFileDTO, accountId);
  }

  @ApiOperation({
    summary: 'Get the contents of an encrypted file.'
  })
  @ApiQuery({
    name: 'accountId',
    type: String,
    description: 'Account performing this operation.',
    required: false,
    example: Configuration.nodeHederaAccountId
  })
  @Get('/encryptedfile/:id')
  public async getEncryptedFileContents(@Param('id') fileId: string, @Query('accountId') accountId?: string): Promise<string> {
    return await this.encryptedFileService.getEncryptedFileContents(fileId, accountId);
  }

  @ApiOperation({
    summary: 'Add more participants to the encrypted file access list.'
  })
  @ApiQuery({
    name: 'accountId',
    type: String,
    description: 'Account performing this operation.',
    required: false,
    example: Configuration.nodeHederaAccountId
  })
  @Put('/encryptedfile/:id/access')
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public async updateEncryptedFileContents(@Param('id') fileId: string, @Body() accessList: UpdateFileParticipantsDTO, @Query('accountId') accountId?: string): Promise<IHederaNetworkResponse> {
    return await this.encryptedFileService.addParticipantsToEncryptedFile(fileId, accessList, accountId);
  }

  @ApiOperation({
    summary: 'Delete an encrypted file.'
  })
  @ApiQuery({
    name: 'accountId',
    type: String,
    description: 'Account performing this operation.',
    required: false,
    example: Configuration.nodeHederaAccountId
  })
  @Delete('/encryptedfile/:id')
  public async deleteEncryptedFile(@Param('id') fileId: string, @Query('accountId') accountId?: string): Promise<IHederaNetworkResponse> {
    return await this.encryptedFileService.deleteEncryptedFile(fileId, accountId);
  }
}
