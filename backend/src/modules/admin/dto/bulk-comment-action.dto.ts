import { ApiProperty } from '@nestjs/swagger';

export class BulkCommentActionDto {
  @ApiProperty({ type: [String] })
  commentIds: string[];

  @ApiProperty({ enum: ['delete', 'flag', 'unflag'] })
  action: 'delete' | 'flag' | 'unflag';

  @ApiProperty({ required: false })
  reason?: string;
}
