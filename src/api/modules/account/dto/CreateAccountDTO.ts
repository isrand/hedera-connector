import {ApiProperty} from '@nestjs/swagger';

export class CreateAccountDTO {
  @ApiProperty({
    type: Number,
    required: true,
    description: 'Initial balance to create the account with',
    example: 100
  })
  public initialBalance!: number;
}
