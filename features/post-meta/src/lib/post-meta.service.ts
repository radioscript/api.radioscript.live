// src/post-meta/post-meta.service.ts
import { CreatePostMetaDto, PostMetaQueryDto, UpdatePostMetaDto } from '@/dtos';
import { Meta, Post, PostMeta } from '@/entities';
import { PaginateResponse } from '@/interfaces';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';

@Injectable()
export class PostMetaService {
  constructor(
    @InjectRepository(PostMeta) private readonly metaRepo: Repository<PostMeta>,
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectRepository(Meta) private readonly metaDefRepo: Repository<Meta>
  ) {}

  async create(dto: CreatePostMetaDto): Promise<PostMeta> {
    const post = await this.postRepo.findOneByOrFail({ id: dto.postId });
    const metaDef = await this.metaDefRepo.findOneByOrFail({ id: dto.metaId });

    const meta = this.metaRepo.create({
      postId: dto.postId,
      metaId: dto.metaId,
      value: dto.value,
      post,
      meta: metaDef,
    });

    return this.metaRepo.save(meta);
  }

  async findAll(query: PostMetaQueryDto): Promise<PaginateResponse<PostMeta[]>> {
    const { key, value, page = 1, limit = 10 } = query;
    const whereConditions: FindOptionsWhere<PostMeta>[] = [];

    if (key) {
      whereConditions.push({ meta: { key } });
    }

    if (value) {
      whereConditions.push({ value });
    }

    const [data, total] = await this.metaRepo.findAndCount({
      where: whereConditions.length ? whereConditions : undefined,
      relations: ['meta', 'post'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findByPostId(postId: string): Promise<PostMeta[]> {
    return this.metaRepo.find({
      where: { postId },
      relations: ['meta', 'post'],
    });
  }

  async update(id: string, dto: UpdatePostMetaDto): Promise<PostMeta> {
    const meta = await this.metaRepo.findOneBy({ id });
    if (!meta) throw new NotFoundException('Meta not found');
    Object.assign(meta, dto);
    return this.metaRepo.save(meta);
  }

  async remove(id: string) {
    const meta = await this.metaRepo.findOneBy({ id });
    if (!meta) throw new NotFoundException('Meta not found');
    return this.metaRepo.softRemove(meta);
  }

  async recover(id: string) {
    const cat = await this.metaRepo.findOne({
      where: { id },
      withDeleted: true,
    });
    return this.metaRepo.recover(cat);
  }
  deleted() {
    return this.metaRepo.find({
      withDeleted: true,
    });
  }
}
