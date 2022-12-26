import { Injectable } from '@nestjs/common';
import { EmailManager } from '../email-transfer/email.manager';
import { PgEmailConfirmationRepository } from "../../../super-admin/infrastructure/pg-email-confirmation.repository";
import {JwtService} from "./jwt.service";
import {PgUsersRepository} from "../../../super-admin/infrastructure/pg-users.repository";

@Injectable()
export class AuthService {
  constructor(
    protected emailConfirmationRepository: PgEmailConfirmationRepository,
    protected emailsManager: EmailManager,
    protected jwtService: JwtService,
    protected usersRepository: PgUsersRepository
  ) {}

  async sendPasswordRecovery(userId: string, email: string): Promise<boolean> {
    const newRecoveryCode = await this.jwtService.createConfirmationCode();
    const result =
      await this.usersRepository.updateConfirmationCode(
        userId,
        newRecoveryCode,
      );

    if (!result) {
      return false;
    }

    await this.emailsManager.sendPasswordRecoveryEmail(email, newRecoveryCode);
    return true;
  }

  async updateConfirmationCode(userId: string): Promise<string | null> {
    const newConfirmationCode = await this.jwtService.createConfirmationCode();
    const result =
      await this.usersRepository.updateConfirmationCode(
        userId,
        newConfirmationCode,
      );

    if (!result) {
      return null;
    }

    return newConfirmationCode;
  }
}
