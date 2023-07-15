import {ApiOperation, ApiQuery, ApiTags} from '@nestjs/swagger';
import {Body, Controller, Get, Param, Post, Query} from '@nestjs/common';
import {CreateEncryptedTopicDTO} from './dtos/CreateEncryptedTopicDTO';
import {IHederaNetworkResponse} from '../../../hedera/responses/interfaces/IHederaNetworkResponse';
import {SendMessageToEncryptedTopicDTO} from './dtos/SendMessageToEncryptedTopicDTO';
import {Configuration} from '../../../configuration/Configuration';
import {EncryptedTopicService} from './EncryptedTopicService';

@ApiTags('Encrypted Topic')
@Controller()
export class EncryptedTopicController {
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public constructor(private readonly encryptedTopicService: EncryptedTopicService) {}

  @ApiOperation({
    summary: 'Create a new encrypted topic.',
    description: `An encrypted topic is a Hedera network topic that utilizes hybrid encryption and submit keys to maintain privacy.\n
While it's still a publicly accessible topic, the contents of the messages are encrypted and will be nonsensical to everyone
except for the topic participants.\n
Upon creation, participants need to be explicitly added to the topic configuration message (the first message in the topic,
akin to a Hyperledger Fabric Channel Configuration block). Their Kyber public key is used to encrypt the configuration message
and any subsequent messages in the topic, ensuring that messages can only be decrypted by using their private key.
`
  })
  @ApiQuery({
    name: 'accountId',
    type: String,
    description: 'Account performing this operation.',
    required: false,
    example: Configuration.nodeHederaAccountId
  })
  @Post('/encryptedtopic')
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public async createEncryptedTopic(@Body() createEncryptedTopicDTO: CreateEncryptedTopicDTO, @Query('accountId') accountId?: string): Promise<IHederaNetworkResponse> {
    return await this.encryptedTopicService.createEncryptedTopic(createEncryptedTopicDTO, accountId);
  }

  @ApiOperation({
    summary: 'Get encrypted topic participants list.'
  })
  @ApiQuery({
    name: 'accountId',
    type: String,
    description: 'Account performing this operation.',
    required: false,
    example: Configuration.nodeHederaAccountId
  })
  @Get('/encryptedtopic/:id/participants')
  public async getEncryptedTopicParticipants(@Param('id') topicId: string, @Query('accountId') accountId?: string): Promise<unknown> {
    return await this.encryptedTopicService.getEncryptedTopicParticipants(topicId, accountId);
  }

  @ApiOperation({
    summary: 'Send a message to an encrypted topic.'
  })
  @ApiQuery({
    name: 'accountId',
    type: String,
    description: 'Account performing this operation.',
    required: false,
    example: Configuration.nodeHederaAccountId
  })
  @Post('/encryptedtopic/:id/message')
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  public async sendMessageToEncryptedTopic(@Param('id') topicId: string, @Body() message: SendMessageToEncryptedTopicDTO, @Query('accountId') accountId?: string): Promise<unknown> {
    return await this.encryptedTopicService.sendMessageToEncryptedTopic(topicId, message.message, accountId);
  }

  @ApiOperation({
    summary: 'Get a message from an encrypted topic given its sequence number.'
  })
  @ApiQuery({
    name: 'accountId',
    type: String,
    description: 'Account performing this operation.',
    required: false,
    example: Configuration.nodeHederaAccountId
  })
  @Get('/encryptedtopic/:id/message/:number')
  public async getMessageFromEncryptedTopic(@Param('id') topicId: string, @Param('number') sequenceNumber: number, @Query('accountId') accountId?: string): Promise<unknown> {
    return await this.encryptedTopicService.getMessageFromEncryptedTopic(topicId, Number(sequenceNumber), accountId);
  }
}
