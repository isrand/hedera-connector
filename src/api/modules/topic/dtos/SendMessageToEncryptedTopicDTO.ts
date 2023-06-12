import {SendMessageToTopicDTO} from './SendMessageToTopicDTO';
import {ApiProperty} from '@nestjs/swagger';

export class SendMessageToEncryptedTopicDTO extends SendMessageToTopicDTO {
  @ApiProperty({
    required: false,
    description: 'List of participants that will receive this message. Contents of this array must be hedera public keys.',
    example: ['302a300506032b65700321005566ae9bf89a8529d009be5bedfc33414243e07f1132aeaa84236c3dd4aa3056']
  })
  public recipients!: ReadonlyArray<string>;
}
