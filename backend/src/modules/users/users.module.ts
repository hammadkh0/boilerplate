import { Module } from '@nestjs/common';

import { AuditLogModule } from '../audit-log/audit-log.module';
import { UploadsModule } from '../uploads/uploads.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [AuditLogModule, UploadsModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
