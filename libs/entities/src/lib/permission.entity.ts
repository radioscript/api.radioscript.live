import { Column, Entity, ManyToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Role } from './role.entity';

@Entity('permissions')
export class Permission extends BaseEntity {
  @Column({ unique: true, length: 128 })
  name: string;

  @Column({ length: 128, nullable: true })
  display_name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 64, nullable: true })
  resource: string; // e.g., 'posts', 'users', 'categories'

  @Column({ length: 32, nullable: true })
  action: string; // e.g., 'create', 'read', 'update', 'delete'

  @Column({ default: true })
  is_active: boolean;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
