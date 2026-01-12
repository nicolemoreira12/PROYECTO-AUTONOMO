import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
}

@Entity('revoked_tokens')
export class RevokedToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'varchar', length: 64 })
  jti!: string; // JWT ID único

  @Column({
    type: 'enum',
    enum: TokenType,
    default: TokenType.ACCESS,
  })
  tokenType!: TokenType;

  @Column({ type: 'uuid', nullable: true })
  userId?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  reason?: string;

  @Column({ type: 'timestamp' })
  expiresAt!: Date; // Cuando expira el token original (para limpiar después)

  @CreateDateColumn()
  revokedAt!: Date;
}
