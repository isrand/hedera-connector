import {ApiProperty} from '@nestjs/swagger';
import {AccessListParticipantDTO} from '../../../../common/dto/AccessListParticipantDTO';

export class UpdateFileParticipantsDTO {
  @ApiProperty({
    type: Array,
    required: true,
    description: 'Array of file participants to be added',
    example: [
      {
        hederaPublicKey: '',
        kyberPublicKey: ''
      }
    ]
  })
  public participants!: Array<AccessListParticipantDTO>;
}
