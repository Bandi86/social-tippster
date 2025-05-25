import { IsOptional, IsUUID } from 'class-validator';

export class GetCommentByIdDto {
  @IsUUID('4', { message: 'Érvényes komment ID szükséges' })
  id: string;

  @IsOptional()
  includeAuthor?: boolean = true;

  @IsOptional()
  includePost?: boolean = true;

  @IsOptional()
  includeReplies?: boolean = false;
}
