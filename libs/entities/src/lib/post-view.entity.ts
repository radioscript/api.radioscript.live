import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Post } from './post.entity';
import { User } from './user.entity';

@Entity('post_views')
export class PostView extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', nullable: true })
  userId?: string;

  @Column({ name: 'post_id' })
  postId: string;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent?: string;

  @Column({ name: 'viewer_id', nullable: true })
  viewerId?: string; // userId for logged users, guest-{uuid} for anonymous users

  @Column({ name: 'view_duration', type: 'int', default: 0 })
  viewDuration: number; // در ثانیه برای پادکست‌ها

  @Column({ name: 'is_completed', default: false })
  isCompleted: boolean; // آیا پادکست تا انتها شنیده شده

  @ManyToOne(() => User, (user) => user.postViews, { onDelete: 'CASCADE', nullable: true })
  user?: User;

  @ManyToOne(() => Post, (post) => post.views, { onDelete: 'CASCADE' })
  post: Post;
}
