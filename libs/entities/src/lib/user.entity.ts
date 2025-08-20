import { Column, CreateDateColumn, Entity, Index, JoinTable, ManyToMany, OneToMany } from 'typeorm';

import { Exclude } from 'class-transformer';
import { BaseEntity } from './base.entity';
import { Comment } from './comment.entity';
import { Donation } from './donation.entity';
import { Media } from './media.entity';
import { PostLike } from './post-like.entity';
import { PostView } from './post-view.entity';
import { Post } from './post.entity';
import { Role } from './role.entity';
import { Token } from './token.entity';

@Entity('users')
@Index(['email'], { where: 'deleted_at IS NULL' }) // Partial index for email
@Index(['phone_number'], { where: 'deleted_at IS NULL' }) // Partial index for phone
export class User extends BaseEntity {
  @Column({ unique: true, nullable: true })
  phone_number: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Exclude()
  @Column({ default: 'system' })
  created_by: 'email' | 'phone_number' | 'social_login' | 'admin' | 'system';

  @Exclude()
  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  first_name: string;

  @Column({ nullable: true })
  last_name: string;

  @Column({ nullable: true })
  avatar_url: string;

  @Column({ nullable: true, length: 500 })
  bio: string;

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];

  @Exclude()
  @OneToMany(() => Token, (token) => token.user)
  tokens: Token[];

  @Exclude()
  @OneToMany(() => Media, (media) => media.author)
  media: Media[];

  @Exclude()
  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  @Exclude()
  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];

  @Exclude()
  @OneToMany(() => PostLike, (like) => like.user)
  postLikes: PostLike[];

  @Exclude()
  @OneToMany(() => PostView, (view) => view.user)
  postViews: PostView[];

  @Exclude()
  @OneToMany(() => Donation, (donation) => donation.user)
  donations: Donation[];

  @Column({ nullable: true, default: false })
  blocked: boolean;

  @Column({ nullable: true })
  block_reason: string;

  @Exclude()
  @CreateDateColumn()
  last_login: Date;
}
