import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { PostMeta } from './post-meta.entity';

@Entity('meta')
export class Meta extends BaseEntity {
  @Column({ unique: true, length: 128 })
  key: string;

  @Column({ length: 255 })
  label: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: ['text', 'number', 'boolean', 'date', 'json', 'url', 'email', 'phone'],
    default: 'text',
  })
  type: 'text' | 'number' | 'boolean' | 'date' | 'json' | 'url' | 'email' | 'phone';

  @Column({ type: 'text', nullable: true })
  default_value?: string;

  @Column({ type: 'json', nullable: true })
  validation_rules?: Record<string, any>; // Store validation rules as JSON

  @Column({ default: false })
  is_required: boolean;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: 0 })
  sort_order: number;

  @OneToMany(() => PostMeta, (postMeta) => postMeta.meta)
  postMeta: PostMeta[];
}
