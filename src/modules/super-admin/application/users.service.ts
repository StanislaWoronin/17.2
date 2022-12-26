import { Injectable } from '@nestjs/common';
import { UserDBModel } from '../infrastructure/entity/userDB.model';
import { PgUsersRepository } from "../infrastructure/pg-users.repository";
import { PgEmailConfirmationRepository } from "../infrastructure/pg-email-confirmation.repository";
import { PgBanInfoRepository } from "../infrastructure/pg-ban-info.repository";
import { _generateHash } from '../../../helper.functions';
import { UserDTO } from '../api/dto/userDTO';
import { BanInfoModel } from '../infrastructure/entity/banInfo.model';
import { EmailConfirmation } from '../infrastructure/entity/emailConfirm.scheme';
import { UserViewModelWithBanInfo } from '../api/dto/userView.model';
import { PgQueryUsersRepository } from '../infrastructure/pg-query-users.repository';
import {EmailConfirmationModel} from "../infrastructure/entity/emailConfirmation.model";
import {toCreatedUserViewModel} from "../../../data-mapper/to-user-view.model";
import { v4 as uuidv4 } from 'uuid';
import {BanUserDto} from "../api/dto/ban-user.dto";

@Injectable()
export class UsersService {
  constructor(
    protected banInfoRepository: PgBanInfoRepository,
    protected usersRepository: PgUsersRepository,
  ) {}

  async createUser(dto: UserDTO, emailConfirmation: EmailConfirmationModel) {
    const passwordHash = await _generateHash(dto.password);
    const userId = uuidv4()

    const accountData = new UserDBModel(
      userId,
      dto.login,
      dto.email,
      passwordHash,
      new Date().toISOString(),
      emailConfirmation.confirmationCode,
      emailConfirmation.isConfirmed
    );

    await this.usersRepository.createUser(accountData);
    const createdUser: UserViewModelWithBanInfo = toCreatedUserViewModel(accountData);

    return {
      user: createdUser,
      code: emailConfirmation.confirmationCode,
    };
  }

  async updateBanStatus(userId: string, dto: BanUserDto) {
    let banDate = null;
    let banReason = null;
    if (dto.isBanned) {
      banDate = new Date();
      banReason = dto.banReason;
    }
    //await this.blogsRepository.updateBanStatus(userId, dto.isBanned);
    //await this.likesRepository.updateBanStatus(userId, dto.isBanned);
    return this.banInfoRepository.saUpdateBanStatus(
        userId,
        dto.isBanned,
        banReason,
        banDate,
    );
  }
}
