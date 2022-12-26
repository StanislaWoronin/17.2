import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { InjectRepository } from "@nestjs/typeorm";
import { EmailConfirmationEntity } from "../modules/super-admin/infrastructure/entity/email-confirmation.entity";
import { PgEmailConfirmationRepository } from "../modules/super-admin/infrastructure/pg-email-confirmation.repository";
import {PgQueryUsersRepository} from "../modules/super-admin/infrastructure/pg-query-users.repository";

@ValidatorConstraint({ name: 'ConfirmationCodeValid', async: true })
@Injectable()
export class ConfirmationCodeValidator implements ValidatorConstraintInterface {
  constructor(
      protected queryUsersRepository: PgQueryUsersRepository,
  ) {}

  async validate(code: string) {
    const emailConfirmation =
      await this.queryUsersRepository.getEmailConfirmationByCodeOrId(
        code,
      );

    if (!emailConfirmation) {
      return false;
    }

    if (emailConfirmation.isConfirmed === true) {
      return false;
    }

    if (emailConfirmation.expirationDate < new Date()) {
      return false;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Confirmation code is not valid';
  }
}
