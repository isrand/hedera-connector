import {SendMessageToTopicDTO} from './SendMessageToTopicDTO';
import {ApiProperty} from '@nestjs/swagger';

export class SendMessageToEncryptedTopicDTO extends SendMessageToTopicDTO {
  @ApiProperty({
    required: false,
    description: 'List of participants that will receive this message. Contents of this array must be hedera public keys.',
    example: ['']
  })
  public recipients!: ReadonlyArray<string>;
}
