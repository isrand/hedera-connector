import {ApiProperty} from '@nestjs/swagger';
import {Configuration} from '../../../configuration/Configuration';

export class HederaConnectorRequestDTO {
  @ApiProperty({
    required: true,
    description: 'Account ID that will perform the transaction',
    example: Configuration.hederaAccountId
  })
  public accountId!: string;
}
