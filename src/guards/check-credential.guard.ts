import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import bcrypt from 'bcrypt';
import { UserDBModel } from '../modules/super-admin/infrastructure/entity/userDB.model';
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../modules/super-admin/infrastructure/entity/user.entity";
import { PgUsersRepository } from "../modules/super-admin/infrastructure/pg-users.repository";
import { BanInfoEntity } from "../modules/super-admin/infrastructure/entity/ban-info.entity";
import { PgBanInfoRepository } from "../modules/super-admin/infrastructure/pg-ban-info.repository";
import { PgQueryUsersRepository } from "../modules/super-admin/infrastructure/pg-query-users.repository";

@Injectable()
export class CheckCredentialGuard implements CanActivate {
  constructor(
    protected banInfoRepository: PgBanInfoRepository,
    protected usersRepository: PgQueryUsersRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const user: UserDBModel | null =
      await this.usersRepository.getUserByLoginOrEmail(
        req.body.loginOrEmail,
      );

    if (!user) {
      throw new UnauthorizedException();
    }

    const banInfo = await this.banInfoRepository.getBanInfo(user.id);

    if (banInfo.isBanned) {
      throw new UnauthorizedException();
    }

    const passwordEqual = await bcrypt.compare(
      req.body.password,
      user.passwordHash,
    ); // TODO need verify

    if (!passwordEqual) {
      throw new UnauthorizedException();
    }

    req.user = user;
    return true;
  }
}
