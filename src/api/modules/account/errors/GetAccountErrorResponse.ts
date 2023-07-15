import {ApiProperty} from '@nestjs/swagger';
import {HttpStatusCode} from 'axios';

export class GetAccountErrorResponse {
  @ApiProperty({
    example: HttpStatusCode.NotFound
  })
  public statusCode!: number;

  @ApiProperty({
    example: 'Account not found in node wallet.'
  })
  public message!: string;

  @ApiProperty({
    example: 'Not Found'
  })
  public error!: string;
}
