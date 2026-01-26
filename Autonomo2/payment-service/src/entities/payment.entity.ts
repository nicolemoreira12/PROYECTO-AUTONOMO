import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { PaymentStatus } from '../core/dtos/payment.dto';

@Entity('payments')
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Index()
    @Column({ type: 'varchar', length: 255 })
    orderId!: string;

    @Index()
    @Column({ type: 'varchar', length: 255, nullable: true })
    providerPaymentId!: string | null; // ID en Stripe (cs_..., pi_...)

    @Column({ type: 'varchar', length: 50 })
    provider!: string; // 'stripe', 'mock', etc.

    @Column({ type: 'integer' })
    amount!: number; // En centavos

    @Column({ type: 'varchar', length: 3 })
    currency!: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    description!: string | null;

    @Column({
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.PENDING,
    })
    status!: PaymentStatus;

    @Column({ type: 'varchar', length: 255, nullable: true })
    customerId!: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    customerEmail!: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    customerName!: string | null;

    @Column({ type: 'varchar', length: 500, nullable: true })
    redirectUrl!: string | null;

    @Column({ type: 'jsonb', nullable: true })
    metadata!: Record<string, any> | null;

    @Column({ type: 'varchar', length: 500, nullable: true })
    errorMessage!: string | null;

    @Column({ type: 'timestamp', nullable: true })
    paidAt!: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    canceledAt!: Date | null;

    @Column({ type: 'integer', default: 0 })
    refundedAmount!: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
