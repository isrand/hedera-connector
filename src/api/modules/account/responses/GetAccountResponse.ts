import {IHederaConnectorResponse} from '../../../responses/IHederaConnectorResponse';
import {ApiProperty} from '@nestjs/swagger';
import {HttpStatusCode} from 'axios';
import {AccountResponse} from './AccountResponse';

export class HederaConnectorGetAccountResponse implements IHederaConnectorResponse {
  @ApiProperty({
    example: HttpStatusCode.Ok
  })
  public statusCode!: number;

  @ApiProperty({
    example: 'Account retrieved.'
  })
  public message!: string;

  @ApiProperty({
    type: AccountResponse
  })
  public payload!: AccountResponse;
}
