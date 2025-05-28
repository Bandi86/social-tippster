import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum MetricType {
  PERFORMANCE = 'performance',
  USAGE = 'usage',
  ERROR = 'error',
  SECURITY = 'security',
}

@Entity('system_metrics')
@Index(['metric_type'])
@Index(['recorded_at'])
export class SystemMetrics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: MetricType,
  })
  metric_type: MetricType;

  @Column({ type: 'varchar', length: 100 })
  metric_name: string;

  @Column({ type: 'decimal', precision: 15, scale: 6 })
  metric_value: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  unit: string;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @CreateDateColumn({ type: 'timestamp' })
  recorded_at: Date;
}
