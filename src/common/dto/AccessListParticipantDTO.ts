import {ApiProperty} from '@nestjs/swagger';
import {IAccessListParticipant} from '../interfaces/IAccessListParticipant';

export class AccessListParticipantDTO implements IAccessListParticipant {
  @ApiProperty({
    required: true,
    description: 'DER-encoded public key of the Hedera account',
    example: '302a300506032b65700321005566ae9bf89a8529d009be5bedfc33414243e07f1132aeaa84236c3dd4aa3056'
  })
  public hederaPublicKey!: string;

  @ApiProperty({
    required: true,
    description: 'Base64-encoded Kyber public key used for encryption',
    example: '1nwcSfQif8fF3Pq3mHwL+XOFPuKPPHhwKSy8gBUiyGgJdYw8nTSfpbq8XaHBqwtOxzRDl2mInjddBqnK9eJCdliN/2ODRFwIttxnXgcv+2eBRgZtPGaLOoYIJ6KvJUQJ...'
  })
  public kyberPublicKey!: string;
}
