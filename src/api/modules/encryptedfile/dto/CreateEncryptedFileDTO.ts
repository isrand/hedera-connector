import {CreateUpdateAppendFileDTO} from '../../file/dtos/CreateUpdateAppendFileDTO';
import {ApiProperty} from '@nestjs/swagger';
import {AccessListParticipantDTO} from '../../../../common/dto/AccessListParticipantDTO';

export class CreateEncryptedFileDTO extends CreateUpdateAppendFileDTO {
  @ApiProperty({
    type: Array,
    required: true,
    description: 'Array of accounts with access to the file',
    example: [
      {
        hederaPublicKey: '',
        kyberPublicKey: ''
      }
    ]
  })
  public accessList!: ReadonlyArray<AccessListParticipantDTO>;

  @ApiProperty({
    type: Number,
    required: true,
    description: 'Size of the Kyber key(s) used for encryption',
    example: 512
  })
  public encryptionSize!: number;
}
