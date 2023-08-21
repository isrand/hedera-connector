import {ApiProperty} from '@nestjs/swagger';
import {IHederaConnectorResponse} from '../../../responses/IHederaConnectorResponse';
import {HttpStatusCode} from 'axios';

export class GetAccountBalanceResponse {
  @ApiProperty({
    example: '1000 ℏ'
  })
  public hbar!: string;
}

export class HederaConnectorAccountBalanceResponse implements IHederaConnectorResponse {
  @ApiProperty({
    example: HttpStatusCode.Ok
  })
  public statusCode!: number;

  @ApiProperty({
    example: 'Account balance retrieved.'
  })
  public message!: string;

  @ApiProperty({
    type: GetAccountBalanceResponse
  })
  public payload!: GetAccountBalanceResponse;
}
