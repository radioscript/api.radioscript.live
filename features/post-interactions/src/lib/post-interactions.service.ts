import { CreatePostLikeDto, CreatePostViewDto } from '@/dtos';
import { Post, PostLike, PostView, User } from '@/entities';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';

@Injectable()
export class PostInteractionsService {
  constructor(
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectRepository(PostLike) private readonly postLikeRepo: Repository<PostLike>,
    @InjectRepository(PostView) private readonly postViewRepo: Repository<PostView>,
    @InjectRepository(User) private readonly userRepo: Repository<User>
  ) {}

  // Like functionality
  async likePost(req: Request, dto: CreatePostLikeDto): Promise<{ liked: boolean; likeCount: number }> {
    const userId = req['user']['sub'];
    const { postId } = dto;

    // Check if post exists
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check if user already liked this post
    const existingLike = await this.postLikeRepo.findOne({
      where: { userId, postId },
    });

    if (existingLike) {
      // Unlike the post
      await this.postLikeRepo.remove(existingLike);
      const likeCount = await this.postLikeRepo.count({ where: { postId } });
      return { liked: false, likeCount };
    } else {
      // Like the post
      const like = this.postLikeRepo.create({
        userId,
        postId,
        user: await this.userRepo.findOneByOrFail({ id: userId }),
        post,
      });
      await this.postLikeRepo.save(like);
      const likeCount = await this.postLikeRepo.count({ where: { postId } });
      return { liked: true, likeCount };
    }
  }

  async checkUserLike(req: Request, postId: string): Promise<{ liked: boolean; likeCount: number }> {
    const userId = req['user']['sub'];

    const liked = await this.postLikeRepo.exists({ where: { userId, postId } });
    const likeCount = await this.postLikeRepo.count({ where: { postId } });

    return { liked, likeCount };
  }

  // View functionality
  async recordView(req: Request, dto: CreatePostViewDto): Promise<void> {
    const { postId, sessionId, viewDuration, isCompleted } = dto;
    const userId = req['user']?.['sub'];
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Check if post exists
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Create view record
    const view = this.postViewRepo.create({
      postId,
      userId,
      ipAddress,
      userAgent,
      sessionId,
      viewDuration: viewDuration || 0,
      isCompleted: isCompleted || false,
      post,
      user: userId ? await this.userRepo.findOneByOrFail({ id: userId }) : undefined,
    });

    await this.postViewRepo.save(view);
  }

  async updateViewDuration(req: Request, postId: string, viewDuration: number, isCompleted = false): Promise<void> {
    const userId = req['user']?.['sub'];
    const sessionId = req.headers['session-id'] as string;

    const whereCondition: any = { postId };
    if (userId) {
      whereCondition.userId = userId;
    } else if (sessionId) {
      whereCondition.sessionId = sessionId;
    } else {
      throw new NotFoundException('User ID or session ID required');
    }

    const view = await this.postViewRepo.findOne({ where: whereCondition });
    if (!view) {
      throw new NotFoundException('View record not found');
    }

    view.viewDuration = viewDuration;
    view.isCompleted = isCompleted;
    await this.postViewRepo.save(view);
  }

  // Get statistics
  async getPostStats(postId: string): Promise<{
    likeCount: number;
    viewCount: number;
    playCount: number;
    uniqueViewers: number;
  }> {
    const likeCount = await this.postLikeRepo.count({ where: { postId } });
    const viewCount = await this.postViewRepo.count({ where: { postId } });

    // For podcasts, count completed plays
    const playCount = await this.postViewRepo.count({
      where: { postId, isCompleted: true },
    });

    // Count unique viewers (by user ID or session ID)
    const uniqueViewers = await this.postViewRepo
      .createQueryBuilder('view')
      .select('COUNT(DISTINCT COALESCE(view.userId, view.sessionId))', 'count')
      .where('view.postId = :postId', { postId })
      .getRawOne()
      .then((result) => parseInt(result.count) || 0);

    return {
      likeCount,
      viewCount,
      playCount,
      uniqueViewers,
    };
  }

  async getUserLikedPosts(
    req: Request,
    page = 1,
    limit = 10
  ): Promise<{
    posts: Post[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const userId = req['user']['sub'];

    const [posts, total] = await this.postRepo
      .createQueryBuilder('post')
      .innerJoin('post.likes', 'like')
      .where('like.userId = :userId', { userId })
      .orderBy('like.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      posts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
