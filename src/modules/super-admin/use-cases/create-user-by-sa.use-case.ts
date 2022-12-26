import { Injectable } from '@nestjs/common';
import { EmailConfirmationModel } from '../infrastructure/entity/emailConfirmation.model';
import { _generateHash } from '../../../helper.functions';
import { PgEmailConfirmationRepository } from "../infrastructure/pg-email-confirmation.repository";

@Injectable()
export class CreateUserBySaUseCase {
  constructor(
    protected emailConfirmationRepository: PgEmailConfirmationRepository,
  ) {}

  async execute(): Promise<EmailConfirmationModel> {
    const emailConfirmation = new EmailConfirmationModel(
      null,
      true,
    );

    return emailConfirmation
  }
}