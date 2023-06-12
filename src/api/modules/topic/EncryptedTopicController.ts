import {ApiOperation, ApiTags} from '@nestjs/swagger';
import {Body, Controller, Delete, Get, Param, Post} from '@nestjs/common';
import {TopicService} from './TopicService';
import {CreateEncryptedTopicDTO} from './dtos/CreateEncryptedTopicDTO';
import {IHederaConnectorResponse} from '../../responses/IHederaConnectorResponse';
import {TopicInfo} from '@hashgraph/sdk';
import {SendMessageToEncryptedTopicDTO} from './dtos/SendMessageToEncryptedTopicDTO';

@ApiTags('Encrypted Topic')
@Controller()
export class EncryptedTopicController {
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public constructor(private readonly topicService: TopicService) {}

  @ApiOperation({
    summary: 'Create a new encrypted topic.',
    description: `An encrypted topic is a Hedera network topic that utilizes hybrid encryption and submit keys to maintain privacy.\n
While it's still a publicly accessible topic, the contents of the messages are encrypted and will be nonsensical to everyone
except for the topic participants.\n
Upon creation, participants need to be explicitly added to the topic configuration message (the first message in the topic,
akin to a Hyperledger Fabric Channel Configuration block). Their RSA public key is used to encrypt the configuration message
and any subsequent messages in the topic, ensuring that messages can only be decrypted by using their private key.
`
  })
  @Post('/encryptedtopic')
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public async createEncryptedTopic(@Body() createEncryptedTopicDTO: CreateEncryptedTopicDTO): Promise<IHederaConnectorResponse> {
    return await this.topicService.createEncryptedTopic(createEncryptedTopicDTO);
  }

  @Get('/encryptedtopic/:id')
  @ApiOperation({
    summary: 'Get encrypted topic information.'
  })
  public async getEncrytedTopicInformation(@Param('id') topicId: string): Promise<TopicInfo> {
    return await this.topicService.getTopicInformation(topicId);
  }

  @Get('/encryptedtopic/:id/participants')
  @ApiOperation({
    summary: 'Get encrypted topic participants list.'
  })
  public async getEncryptedTopicParticipants(@Param('id') topicId: string): Promise<unknown> {
    return await this.topicService.getEncryptedTopicParticipants(topicId);
  }

  @Delete('/encryptedtopic/:id')
  @ApiOperation({
    summary: 'Delete an encrypted topic.'
  })
  public async deleteEncryptedTopic(@Param('id') topicId: string): Promise<IHederaConnectorResponse> {
    return await this.topicService.deleteTopic(topicId);
  }

  @ApiOperation({
    summary: 'Send a message to an encrypted topic.'
  })
  @Post('/encryptedtopic/:id/message')
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public async sendMessageToEncryptedTopic(@Param('id') topicId: string, @Body() message: SendMessageToEncryptedTopicDTO): Promise<unknown> {
    return await this.topicService.sendMessageToEncryptedTopic(topicId, message.message);
  }

  @ApiOperation({
    summary: 'Get a message from an encrypted topic given its sequence number.'
  })
  @Get('/encryptedtopic/:id/message/:number')
  public async getMessageFromEncryptedTopic(@Param('id') topicId: string, @Param('number') sequenceNumber: number): Promise<unknown> {
    return await this.topicService.getMessageFromEncryptedTopic(topicId, Number(sequenceNumber));
  }
}
