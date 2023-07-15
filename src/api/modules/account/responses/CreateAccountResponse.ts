import {ApiProperty} from '@nestjs/swagger';
import {IHederaConnectorResponse} from '../../../responses/IHederaConnectorResponse';
import {HttpStatusCode} from 'axios';
import {AccountResponse} from './AccountResponse';

export class HederaConnectorCreateAccountResponse implements IHederaConnectorResponse {
  @ApiProperty({
    example: HttpStatusCode.Created
  })
  public statusCode!: number;

  @ApiProperty({
    example: 'Account created.'
  })
  public message!: string;

  @ApiProperty({
    type: AccountResponse
  })
  public payload!: AccountResponse;
}
