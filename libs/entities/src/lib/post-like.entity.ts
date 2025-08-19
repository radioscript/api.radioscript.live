import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Post } from './post.entity';
import { User } from './user.entity';

@Entity('post_likes')
@Unique(['userId', 'postId'])
export class PostLike extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'post_id' })
  postId: string;

  @ManyToOne(() => User, (user) => user.postLikes, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Post, (post) => post.likes, { onDelete: 'CASCADE' })
  post: Post;
}
