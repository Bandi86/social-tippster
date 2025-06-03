import { ApiProperty } from '@nestjs/swagger';

export class BulkSnoozeDto {
  @ApiProperty({ type: [String] })
  ids: string[];

  @ApiProperty({ type: String })
  snoozed_until: string; // ISO string
}
