import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsObject, IsString } from 'class-validator';

export class ProjectFileDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  path: string;

  @ApiProperty()
  @IsString()
  type: 'file' | 'directory';

  @ApiProperty()
  @IsNumber()
  size: number;

  @ApiProperty()
  @IsString()
  lastModified: string;
}

export class ProjectStatusDto {
  @ApiProperty()
  @IsString()
  projectName: string;

  @ApiProperty()
  @IsString()
  status: 'active' | 'inactive' | 'error';

  @ApiProperty()
  @IsString()
  gitBranch: string;

  @ApiProperty()
  @IsString()
  lastCommit: string;

  @ApiProperty()
  @IsNumber()
  uncommittedChanges: number;

  @ApiProperty({ type: [ProjectFileDto] })
  @IsArray()
  recentFiles: ProjectFileDto[];

  @ApiProperty()
  @IsString()
  timestamp: string;
}

export class ProjectStatsDto {
  @ApiProperty()
  @IsNumber()
  totalFiles: number;

  @ApiProperty()
  @IsNumber()
  totalLines: number;

  @ApiProperty()
  @IsObject()
  fileTypes: Record<string, number>;

  @ApiProperty()
  @IsNumber()
  packageSize: number;

  @ApiProperty()
  @IsString()
  timestamp: string;
}
