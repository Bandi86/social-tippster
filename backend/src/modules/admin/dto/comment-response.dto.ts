import { ApiProperty } from '@nestjs/swagger';

export class CommentResponseDto {
  @ApiProperty({ description: 'Komment azonosító' })
  id: string;

  @ApiProperty({ description: 'Komment tartalma' })
  content: string;

  @ApiProperty({ description: 'Bejegyzés azonosító' })
  postId: string;

  @ApiProperty({ description: 'Szerző azonosító' })
  authorId: string;

  @ApiProperty({ description: 'Szerző adatok', required: false })
  author?: {
    user_id: string;
    username: string;
    email: string;
    is_verified: boolean;
  };

  @ApiProperty({ description: 'Megjelölés oka', required: false })
  flagReason?: string;

  @ApiProperty({ description: 'Megjelölés időpontja', required: false })
  flaggedAt?: Date;

  @ApiProperty({ description: 'Megjelölő felhasználó', required: false })
  flaggedBy?: string;

  @ApiProperty({ description: 'Létrehozás időpontja' })
  created_at: Date;

  @ApiProperty({ description: 'Módosítás időpontja' })
  updated_at: Date;
}
