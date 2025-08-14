import { CommentService } from '@/comments';
import { PostService } from '@/posts';
import { UserService } from '@/users';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DashboardService {
  constructor(private readonly userService: UserService, private readonly postService: PostService, private readonly commentService: CommentService) {}

  async getDashboardData() {
    const totalUsers = await this.userService.count();
    const totalPosts = await this.postService.count();
    const totalPodcasts = await this.postService.podcastCount();
    const totalVideos = await this.postService.videoCount();
    const totalArticles = await this.postService.articleCount();
    const totalComments = await this.commentService.count();
    const totalPendingComments = await this.commentService.pendingCount();
    const totalApprovedComments = await this.commentService.approvedCount();
    const totalSpamComments = await this.commentService.spamCount();
    return {
      totalUsers,
      totalPosts,
      totalPodcasts,
      totalVideos,
      totalArticles,
      totalComments,
      totalPendingComments,
      totalApprovedComments,
      totalSpamComments,
    };
  }
}
