import {ApiProperty} from '@nestjs/swagger';
import {TopicParticipantDTO} from './TopicParticipantDTO';
import {HederaConnectorRequestDTO} from '../../../common/dto/HederaConnectorRequestDTO';
import {Configuration} from '../../../../configuration/Configuration';

export class CreateEncryptedTopicDTO extends HederaConnectorRequestDTO {
  @ApiProperty({
    required: true,
    description: 'Topic name',
    example: 'Discussion chat'
  })
  public topicName!: string;

  @ApiProperty({
    type: Array,
    required: true,
    description: 'Array of topic participants',
    example: [
      {
        hederaPublicKey: Configuration.hederaPublicKey,
        kyberPublicKey: Configuration.kyberPublicKey
      }
    ]
  })
  public participants!: Array<TopicParticipantDTO>;
}
