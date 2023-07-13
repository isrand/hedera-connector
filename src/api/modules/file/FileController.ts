import {Body, Controller, Delete, Get, Param, Post, Put, Query} from '@nestjs/common';
import {ApiOperation, ApiQuery, ApiTags} from '@nestjs/swagger';
import {FileService} from './FileService';
import {IHederaConnectorResponse} from '../../responses/IHederaConnectorResponse';
import {CreateUpdateAppendFileDTO} from './dtos/CreateUpdateAppendFileDTO';
import {Configuration} from '../../../configuration/Configuration';

@ApiTags('File')
@Controller()
export class FileController {
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public constructor(private readonly fileService: FileService) {}

  @ApiOperation({
    summary: 'Create a new public file.',
    description: `This endpoint creates a new public file on the Hedera network.
The endpoint accepts a request body with the contents of the file, but can also be ran with an empty "contents" key. This will create an empty file, to which data can be appended later, or updated as a whole.`
  })
  @ApiQuery({
    name: 'accountId',
    type: String,
    description: 'Account performing this operation.',
    required: false,
    example: Configuration.nodeHederaAccountId
  })
  @Post('/file')
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public async createPublicFile(@Body() createPublicFileDTO: CreateUpdateAppendFileDTO, @Query('accountId') accountId?: string): Promise<IHederaConnectorResponse> {
    return await this.fileService.createPublicFile(createPublicFileDTO, accountId);
  }

  @ApiOperation({
    summary: 'Get the contents of a public file.'
  })
  @ApiQuery({
    name: 'accountId',
    type: String,
    description: 'Account performing this operation.',
    required: false,
    example: Configuration.nodeHederaAccountId
  })
  @Get('/file/:id')
  public async getPublicFile(@Param('id') fileId: string, @Query('accountId') accountId?: string): Promise<string> {
    return await this.fileService.getPublicFileContents(fileId, accountId);
  }

  @ApiOperation({
    summary: 'Update a public file.'
  })
  @ApiQuery({
    name: 'accountId',
    type: String,
    description: 'Account performing this operation.',
    required: false,
    example: Configuration.nodeHederaAccountId
  })
  @Put('/file/:id')
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public async updatePublicFile(@Param('id') fileId: string, @Body() createPublicFileDTO: CreateUpdateAppendFileDTO, @Query('accountId') accountId?: string): Promise<IHederaConnectorResponse> {
    return await this.fileService.updatePublicFile(fileId, createPublicFileDTO, accountId);
  }

  @ApiOperation({
    summary: 'Append contents to a public file.'
  })
  @ApiQuery({
    name: 'accountId',
    type: String,
    description: 'Account performing this operation.',
    required: false,
    example: Configuration.nodeHederaAccountId
  })
  @Put('/file/:id/append/:contents')
  public async appendToPublicFile(@Param('id') fileId: string, @Param('contents') contents: string, @Query('accountId') accountId?: string): Promise<IHederaConnectorResponse> {
    return await this.fileService.appendToPublicFile(fileId, contents, accountId);
  }

  @ApiOperation({
    summary: 'Delete a public file.'
  })
  @ApiQuery({
    name: 'accountId',
    type: String,
    description: 'Account performing this operation.',
    required: false,
    example: Configuration.nodeHederaAccountId
  })
  @Delete('/file/:id')
  public async deletePublicFile(@Param('id') fileId: string, @Query('accountId') accountId?: string): Promise<IHederaConnectorResponse> {
    return await this.fileService.deleteFile(fileId, accountId);
  }
}
