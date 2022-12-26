import { Injectable } from '@nestjs/common';
import { EmailConfirmationModel } from '../infrastructure/entity/emailConfirmation.model';
import add from 'date-fns/add';
import { v4 as uuidv4 } from 'uuid';
import { settings } from '../../../settings';
import { PgEmailConfirmationRepository } from "../infrastructure/pg-email-confirmation.repository";
import { EmailManager } from "../../public/auth/email-transfer/email.manager";
import {JwtService} from "../../public/auth/application/jwt.service";

@Injectable()
export class CreateUserUseCase {
  constructor(
    protected emailConfirmationRepository: PgEmailConfirmationRepository,
    protected emailManager: EmailManager,
    protected jwtService: JwtService
  ) {}

  async execute(userAccountId: string, email: string): Promise<EmailConfirmationModel> {
    const confirmationCode = await this.jwtService.createConfirmationCode()
    const emailConfirmation = new EmailConfirmationModel(
        confirmationCode,
      false,
    );

    this.emailManager.sendConfirmationEmail(
      email,
      emailConfirmation.confirmationCode,
    );

    return emailConfirmation
  }
}