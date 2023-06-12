import {Body, Controller, Delete, Get, Param, Post} from '@nestjs/common';
import {ApiOperation, ApiTags} from '@nestjs/swagger';
import {SendMessageToTopicDTO} from './dtos/SendMessageToTopicDTO';
import {TopicService} from './TopicService';
import {IHederaConnectorResponse} from '../../responses/IHederaConnectorResponse';
import {TopicInfo} from '@hashgraph/sdk';

@ApiTags('Topic')
@Controller()
export class TopicController {
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public constructor(private readonly topicService: TopicService) {}

  @Post('/topic')
  @ApiOperation({
    summary: 'Create a new public topic.'
  })
  public async createPublicTopic(): Promise<IHederaConnectorResponse> {
    return await this.topicService.createPublicTopic();
  }

  @Get('/topic/:id')
  @ApiOperation({
    summary: 'Get public topic information.'
  })
  public async getPublicTopicInformation(@Param('id') topicId: string): Promise<TopicInfo> {
    return await this.topicService.getTopicInformation(topicId);
  }

  @Delete('/topic/:id')
  @ApiOperation({
    summary: 'Delete a public topic.'
  })
  public async deletePublicTopic(@Param('id') topicId: string): Promise<IHederaConnectorResponse> {
    return await this.topicService.deleteTopic(topicId);
  }

  @ApiOperation({
    summary: 'Send a message to a public topic.'
  })
  @Post('/topic/:id/message')
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public async sendMessageToPublicTopic(@Param('id') topicId: string, @Body() message: SendMessageToTopicDTO): Promise<IHederaConnectorResponse> {
    return await this.topicService.sendMessageToPublicTopic(topicId, message.message);
  }

  @ApiOperation({
    summary: 'Get a message from a topic given its sequence number.'
  })
  @Get('/topic/:id/message/:number')
  public async getMessageFromTopic(@Param('id') topicId: string, @Param('number') sequenceNumber: number): Promise<unknown> {
    return await this.topicService.getMessageFromPublicTopic(topicId, sequenceNumber);
  }
}
