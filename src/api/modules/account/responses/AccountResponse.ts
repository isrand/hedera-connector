import {ApiProperty} from '@nestjs/swagger';

export class AccountResponse {
  @ApiProperty({
    description: 'Id of the new Hedera Account',
    example: '0.0.1234'
  })
  public hederaAccountId!: string;

  @ApiProperty({
    description: 'Hedera Account public key',
    example: '302a300506032b...'
  })
  public hederaPublicKey!: string;

  @ApiProperty({
    description: 'Kyber public key of size 512',
    example: 'OjcSV4DE54uUwDph4XUoF1g6EikOxju9NrDPmhChiMNa...'
  })
  public kyber512PublicKey!: string;

  @ApiProperty({
    description: 'Kyber public key of size 768',
    example: 'T4SZPfAhLDwsxwynGzqtZVVbilV3wKoy9BEquvwrt/Sj...'
  })
  public kyber768PublicKey!: string;

  @ApiProperty({
    description: 'Kyber public key of size 1024',
    example: 'd7FPALymNtNGsMA9SKKhHqgfH/rJq4bBjSUMMtaVgtei...'
  })
  public kyber1024PublicKey!: string;
}
