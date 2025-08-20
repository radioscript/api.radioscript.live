import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity('donations')
export class Donation extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', nullable: true })
  userId?: string;

  @Column({ name: 'donor_name', nullable: true })
  donorName?: string;

  @Column({ name: 'donor_email', nullable: true })
  donorEmail?: string;

  @Column({ name: 'amount', type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ name: 'currency', default: 'IRR' })
  currency: 'IRR' | 'USD';

  @Column({ name: 'payment_method', nullable: true })
  paymentMethod?: string;

  @Column({ name: 'transaction_id', nullable: true })
  transactionId?: string;

  @Column({ name: 'payment_status', default: 'pending' })
  paymentStatus: 'pending' | 'completed' | 'failed' | 'cancelled';

  @Column({ name: 'ip_address', nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent?: string;

  @Column({ name: 'viewer_id', nullable: true })
  viewerId?: string; // userId for logged users, guest-{uuid} for anonymous users

  @Column({ name: 'message', type: 'text', nullable: true })
  message?: string;

  @Column({ name: 'is_anonymous', default: false })
  isAnonymous: boolean;

  @ManyToOne(() => User, (user) => user.donations, { onDelete: 'SET NULL', nullable: true })
  user?: User;
}
