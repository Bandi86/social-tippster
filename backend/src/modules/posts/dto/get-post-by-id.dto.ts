import { IsOptional, IsUUID } from 'class-validator';

export class GetPostByIdDto {
  @IsUUID('4', { message: 'Érvényes post ID szükséges' })
  id: string;

  @IsOptional()
  includeAuthor?: boolean = true;

  @IsOptional()
  includeStats?: boolean = true;

  @IsOptional()
  includeUserInteractions?: boolean = true;

  @IsOptional()
  includeComments?: boolean = false;
}
