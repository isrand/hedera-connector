import {Body, Controller, Delete, Get, Param, Post, Query} from '@nestjs/common';
import {ApiOperation, ApiQuery, ApiTags} from '@nestjs/swagger';
import {SendMessageToTopicDTO} from './dtos/SendMessageToTopicDTO';
import {TopicService} from './TopicService';
import {IHederaConnectorResponse} from '../../responses/IHederaConnectorResponse';
import {TopicInfo} from '@hashgraph/sdk';
import {Configuration} from '../../../configuration/Configuration';

@ApiTags('Topic')
@Controller()
export class TopicController {
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public constructor(private readonly topicService: TopicService) {}

  @ApiOperation({
    summary: 'Create a new public topic.'
  })
  @ApiQuery({
    name: 'accountId',
    type: String,
    description: 'Account performing this operation.',
    required: false,
    example: Configuration.nodeHederaAccountId
  })
  @Post('/topic')
  public async createPublicTopic(@Query('accountId') accountId?: string): Promise<IHederaConnectorResponse> {
    return await this.topicService.createPublicTopic(accountId);
  }

  @ApiOperation({
    summary: 'Get public topic information.'
  })
  @ApiQuery({
    name: 'accountId',
    type: String,
    description: 'Account performing this operation.',
    required: false,
    example: Configuration.nodeHederaAccountId
  })
  @Get('/topic/:id')
  public async getPublicTopicInformation(@Param('id') topicId: string, @Query('accountId') accountId?: string): Promise<TopicInfo> {
    return await this.topicService.getTopicInformation(topicId, accountId);
  }

  @ApiOperation({
    summary: 'Delete a public topic.'
  })
  @ApiQuery({
    name: 'accountId',
    type: String,
    description: 'Account performing this operation.',
    required: false,
    example: Configuration.nodeHederaAccountId
  })
  @Delete('/topic/:id')
  public async deletePublicTopic(@Param('id') topicId: string, @Query('accountId') accountId?: string): Promise<IHederaConnectorResponse> {
    return await this.topicService.deleteTopic(topicId, accountId);
  }

  @ApiOperation({
    summary: 'Send a message to a public topic.'
  })
  @ApiQuery({
    name: 'accountId',
    type: String,
    description: 'Account performing this operation.',
    required: false,
    example: Configuration.nodeHederaAccountId
  })
  @Post('/topic/:id/message')
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public async sendMessageToPublicTopic(@Param('id') topicId: string, @Body() message: SendMessageToTopicDTO, @Query('accountId') accountId?: string): Promise<IHederaConnectorResponse> {
    return await this.topicService.sendMessageToPublicTopic(topicId, message.message, accountId);
  }

  @ApiOperation({
    summary: 'Get a message from a topic given its sequence number.'
  })
  @ApiQuery({
    name: 'accountId',
    type: String,
    description: 'Account performing this operation.',
    required: false,
    example: Configuration.nodeHederaAccountId
  })
  @Get('/topic/:id/message/:number')
  public async getMessageFromTopic(@Param('id') topicId: string, @Param('number') sequenceNumber: number, @Query('accountId') accountId?: string): Promise<unknown> {
    return await this.topicService.getMessageFromPublicTopic(topicId, sequenceNumber, accountId);
  }
}
