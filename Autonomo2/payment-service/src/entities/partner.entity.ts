import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('partners')
export class Partner {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 255 })
  webhookUrl!: string;

  @Column({ type: 'varchar', length: 255 })
  hmacSecret!: string;

  @Column('simple-array')
  subscribedEvents!: string[];

  @CreateDateColumn()
  createdAt!: Date;
}
