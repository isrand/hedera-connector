import {ApiProperty} from '@nestjs/swagger';

export class CreateUpdateAppendFileDTO {
  @ApiProperty({
    required: false,
    description: 'File contents',
    example: 'These are the file contents'
  })
  public contents?: string;
}
