import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import type { Request } from 'express';

import { CurrentUser, Roles } from '../shared/decorators';
import { MAX_FILE_SIZE_BYTES } from '../shared/constants';
import type { AuthUser } from '../shared/types';
import { getClientIp } from '../shared/utils';
import { ListUsersQueryDto, UpdateProfileDto, UpdateUserStatusDto } from './dto';
import { UsersService } from './users.service';

const uuidPipe = new ParseUUIDPipe({ version: '7' });

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get the signed-in user' })
  @ApiOkResponse({ description: 'The signed-in profile' })
  getMe(@CurrentUser() user: AuthUser) {
    return this.usersService.getMe(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update the signed-in profile' })
  updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateMe(user.id, dto);
  }

  @Post('me/avatar')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Replace the signed-in user avatar' })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_FILE_SIZE_BYTES } }))
  updateAvatar(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: { buffer: Buffer; size: number; mimetype: string } | undefined,
  ) {
    return this.usersService.updateAvatar(user.id, file);
  }

  /**
   * Lists users for the admin table.
   * Uses offset pagination so the UI can jump to a page number.
   */
  @Get()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'List users for the admin table' })
  list(@Query() query: ListUsersQueryDto) {
    return this.usersService.listForAdmin(query);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get one user' })
  getOne(@Param('id', uuidPipe) id: string) {
    return this.usersService.getForAdmin(id);
  }

  @Patch(':id/status')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Suspend or activate a user' })
  updateStatus(
    @Param('id', uuidPipe) id: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser() actor: AuthUser,
    @Req() request: Request,
  ) {
    return this.usersService.updateStatus(id, dto.status, actor, getClientIp(request));
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a user' })
  remove(
    @Param('id', uuidPipe) id: string,
    @CurrentUser() actor: AuthUser,
    @Req() request: Request,
  ) {
    return this.usersService.remove(id, actor, getClientIp(request));
  }
}
