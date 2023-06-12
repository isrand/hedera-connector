import {Body, Controller, Delete, Get, Param, Post, Put} from '@nestjs/common';
import {ApiOperation, ApiTags} from '@nestjs/swagger';
import {FileService} from './FileService';
import {IHederaConnectorResponse} from '../../responses/IHederaConnectorResponse';
import {CreateUpdateAppendFileDTO} from './dtos/CreateUpdateAppendFileDTO';

@ApiTags('File')
@Controller()
export class FileController {
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public constructor(private readonly fileService: FileService) {}

  @Post('/file')
  @ApiOperation({
    summary: 'Create a new public file.',
    description: `This endpoint creates a new public file on the Hedera network.
The endpoint accepts a request body with the contents of the file, but can also be ran with an empty "contents" key. This will create an empty file, to which data can be appended later, or updated as a whole.`
  })
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public async createPublicFile(@Body() createPublicFileDTO: CreateUpdateAppendFileDTO): Promise<IHederaConnectorResponse> {
    return await this.fileService.createPublicFile(createPublicFileDTO);
  }

  @Get('/file/:id')
  @ApiOperation({
    summary: 'Get the contents of a public file.'
  })
  public async getPublicFile(@Param('id') fileId: string): Promise<string> {
    return await this.fileService.getPublicFileContents(fileId);
  }

  @Put('/file/:id')
  @ApiOperation({
    summary: 'Update a public file.'
  })
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public async updatePublicFile(@Param('id') fileId: string, @Body() createPublicFileDTO: CreateUpdateAppendFileDTO): Promise<IHederaConnectorResponse> {
    return await this.fileService.updatePublicFile(fileId, createPublicFileDTO);
  }

  @Put('/file/:id/append/:contents')
  @ApiOperation({
    summary: 'Append contents to a public file.'
  })
  public async appendToPublicFile(@Param('id') fileId: string, @Param('contents') contents: string): Promise<IHederaConnectorResponse> {
    return await this.fileService.appendToPublicFile(fileId, contents);
  }

  @Delete('/file/:id')
  @ApiOperation({
    summary: 'Delete a public file.'
  })
  public async deletePublicFile(@Param('id') fileId: string): Promise<IHederaConnectorResponse> {
    return await this.fileService.deleteFile(fileId);
  }
}
