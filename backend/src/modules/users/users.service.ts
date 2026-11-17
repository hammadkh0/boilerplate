import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditAction, Prisma, UserStatus } from '@prisma/client';
import sharp from 'sharp';

import { AuditLogService } from '../audit-log/audit-log.service';
import { AUDIT_ENTITY } from '../audit-log/constants';
import { PrismaService } from '../shared/prisma/prisma.service';
import type { AuthUser } from '../shared/types';
import type { PaginatedResult } from '../shared/types';
import {
  buildOrderBy,
  buildPaginatedResult,
  buildPaginationArgs,
  buildPatchData,
  buildSearchWhere,
  requireDefined,
} from '../shared/helpers';
import { IMAGE_TYPES, MAX_FILE_SIZE_BYTES } from '../shared/constants';
import { STORAGE_FOLDERS, AVATAR_MAX_WIDTH } from '../uploads/constants';
import { UploadsService } from '../uploads/uploads.service';
import { USER_SEARCH_FIELDS, USER_SORTABLE_FIELDS } from './constants';
import type { ListUsersQueryDto, UpdateProfileDto } from './dto';
import { softDelete, SOFT_DELETE_MODEL } from './helpers';
import {
  ADMIN_USER_LIST_SELECT,
  USER_PROFILE_SELECT,
  type AdminUserListItem,
  type UserProfile,
} from './types';

type UploadFile = {
  buffer: Buffer;
  size: number;
  mimetype: string;
};

/**
 * Profile routes for the signed-in user, and the admin user table.
 * Admin list uses offset pagination so the UI can jump to a page.
 */
@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
    private readonly uploads: UploadsService,
  ) {}

  async getMe(userId: string): Promise<UserProfile> {
    const user = await this.prisma.withSoftDelete.user.findUnique({
      where: { id: requireDefined(userId, 'userId') },
      select: USER_PROFILE_SELECT,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.withAvatarUrl(user);
  }

  async updateMe(userId: string, dto: UpdateProfileDto): Promise<UserProfile> {
    const data = buildPatchData({ fullName: dto.fullName });
    if (Object.keys(data).length === 0) {
      return this.getMe(userId);
    }
    const ownerId = requireDefined(userId, 'userId');
    await this.prisma.user.updateMany({
      where: { id: ownerId, deletedAt: null },
      data,
    });
    return this.getMe(ownerId);
  }

  async updateAvatar(userId: string, file: UploadFile | undefined): Promise<UserProfile> {
    const ownerId = requireDefined(userId, 'userId');
    this.uploads.assertConfigured();
    if (!file || file.size === 0) {
      throw new BadRequestException('An image file is required');
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException('Image exceeds the size limit');
    }
    await this.assertImage(file.buffer);

    const webp = await sharp(file.buffer)
      .rotate()
      .resize({ width: AVATAR_MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const current = await this.prisma.withSoftDelete.user.findUnique({
      where: { id: ownerId },
      select: { avatarKey: true },
    });
    if (!current) {
      throw new NotFoundException('User not found');
    }

    const key = await this.uploads.uploadBuffer(
      STORAGE_FOLDERS.AVATARS,
      webp,
      'image/webp',
      'webp',
    );
    await this.prisma.user.updateMany({
      where: { id: ownerId, deletedAt: null },
      data: { avatarKey: key },
    });
    if (current.avatarKey) {
      await this.uploads.deleteByKey(current.avatarKey);
    }
    return this.getMe(ownerId);
  }

  async listForAdmin(query: ListUsersQueryDto): Promise<PaginatedResult<AdminUserListItem>> {
    const where: Prisma.UserWhereInput = {
      ...buildSearchWhere(query.search, USER_SEARCH_FIELDS),
      ...(query.role ? { role: query.role } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...this.verifiedFilter(query.emailVerified),
      ...this.createdRange(query.createdFrom, query.createdTo),
    };

    const [items, total] = await this.prisma.withSoftDelete.$transaction([
      this.prisma.withSoftDelete.user.findMany({
        where,
        select: ADMIN_USER_LIST_SELECT,
        orderBy: buildOrderBy(query.sortBy, query.sortOrder, USER_SORTABLE_FIELDS, {
          createdAt: 'desc',
        }),
        ...buildPaginationArgs({ page: query.page, limit: query.limit }),
      }),
      this.prisma.withSoftDelete.user.count({ where }),
    ]);

    return buildPaginatedResult(items, total, query.page, query.limit);
  }

  async getForAdmin(id: string): Promise<UserProfile> {
    const user = await this.prisma.withSoftDelete.user.findUnique({
      where: { id },
      select: USER_PROFILE_SELECT,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.withAvatarUrl(user);
  }

  async updateStatus(
    id: string,
    status: UserStatus,
    actor: AuthUser,
    ip?: string,
  ): Promise<AdminUserListItem> {
    if (id === actor.id) {
      throw new ForbiddenException('You cannot change your own status');
    }

    const action =
      status === UserStatus.SUSPENDED ? AuditAction.USER_SUSPENDED : AuditAction.USER_ACTIVATED;
    await this.prisma.$transaction(async (tx) => {
      const updated = await tx.user.updateMany({
        where: { id, deletedAt: null },
        data: { status },
      });
      if (updated.count !== 1) {
        throw new NotFoundException('User not found');
      }
      await this.auditLog.record(tx, {
        actorId: actor.id,
        action,
        entityType: AUDIT_ENTITY.USER,
        entityId: id,
        ip,
      });
    }, this.auditLog.transactionOptions());

    const user = await this.prisma.withSoftDelete.user.findUnique({
      where: { id },
      select: ADMIN_USER_LIST_SELECT,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async remove(id: string, actor: AuthUser, ip?: string): Promise<{ message: string }> {
    if (id === actor.id) {
      throw new ForbiddenException('You cannot delete your own account');
    }

    await this.prisma.$transaction(async (tx) => {
      await softDelete(tx, SOFT_DELETE_MODEL.USER, id);
      await this.auditLog.record(tx, {
        actorId: actor.id,
        action: AuditAction.USER_SOFT_DELETED,
        entityType: AUDIT_ENTITY.USER,
        entityId: id,
        ip,
      });
    }, this.auditLog.transactionOptions());

    return { message: 'User deleted' };
  }

  private verifiedFilter(emailVerified: boolean | undefined): Prisma.UserWhereInput {
    if (emailVerified === undefined) {
      return {};
    }
    return emailVerified ? { emailVerifiedAt: { not: null } } : { emailVerifiedAt: null };
  }

  private createdRange(from?: string, to?: string): Prisma.UserWhereInput {
    if (!from && !to) {
      return {};
    }
    return {
      createdAt: {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      },
    };
  }

  private async withAvatarUrl(user: {
    avatarKey: string | null;
    id: string;
    email: string;
    fullName: string;
    role: UserProfile['role'];
    status: UserProfile['status'];
    emailVerifiedAt: Date | null;
    createdAt: Date;
  }): Promise<UserProfile> {
    const { avatarKey, ...profile } = user;
    const avatarUrl = avatarKey ? await this.uploads.getFileByKey(avatarKey) : null;
    return { ...profile, avatarUrl };
  }

  private async assertImage(buffer: Buffer): Promise<void> {
    const { fileTypeFromBuffer } = await import('file-type');
    const detected = await fileTypeFromBuffer(buffer);
    const allowed = IMAGE_TYPES as readonly string[];
    if (!detected || !allowed.includes(detected.mime)) {
      throw new BadRequestException('File must be a jpeg, png, gif, or webp image');
    }
  }
}
