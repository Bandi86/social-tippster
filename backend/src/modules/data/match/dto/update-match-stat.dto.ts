import { PartialType } from '@nestjs/swagger';
import { CreateMatchStatDto } from './create-match-stat.dto';

export class UpdateMatchStatDto extends PartialType(CreateMatchStatDto) {}
