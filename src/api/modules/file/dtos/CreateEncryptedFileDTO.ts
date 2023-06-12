import {CreateUpdateAppendFileDTO} from './CreateUpdateAppendFileDTO';
import {TopicParticipantDTO} from '../../topic/dtos/TopicParticipantDTO';
import {ApiProperty} from '@nestjs/swagger';

export class CreateEncryptedFileDTO extends CreateUpdateAppendFileDTO {
  @ApiProperty({
    type: Array,
    required: true,
    description: 'Array of accounts with access to the file',
    example: []
  })
  public accessList!: ReadonlyArray<TopicParticipantDTO>;
}
