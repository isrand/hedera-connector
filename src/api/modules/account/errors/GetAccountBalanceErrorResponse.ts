import {ApiProperty} from '@nestjs/swagger';
import {HttpStatusCode} from 'axios';

export class GetAccountBalanceErrorResponse {
  @ApiProperty({
    example: HttpStatusCode.NotFound
  })
  public statusCode!: number;

  @ApiProperty({
    example: 'Account not found.'
  })
  public message!: string;

  @ApiProperty({
    example: 'Not Found'
  })
  public error!: string;
}
