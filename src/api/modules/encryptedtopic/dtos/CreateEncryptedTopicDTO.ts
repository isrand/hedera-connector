import {ApiProperty} from '@nestjs/swagger';
import {AccessListParticipantDTO} from '../../../../common/dto/AccessListParticipantDTO';

export class CreateEncryptedTopicDTO {
  @ApiProperty({
    required: true,
    description: 'Topic encryption size: 512-bit, 768 or 1024',
    example: 512
  })
  public encryptionSize!: number;

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
        hederaPublicKey: '',
        kyberPublicKey: ''
      }
    ]
  })
  public participants!: Array<AccessListParticipantDTO>;
}
