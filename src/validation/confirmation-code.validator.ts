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
import {JwtService} from "../modules/public/auth/application/jwt.service";

@ValidatorConstraint({ name: 'ConfirmationCodeValid', async: true })
@Injectable()
export class ConfirmationCodeValidator implements ValidatorConstraintInterface {
  constructor(
      protected queryUsersRepository: PgQueryUsersRepository,
      protected jwtService: JwtService
  ) {}

  async validate(code: string) {
    const emailConfirmation =
      await this.queryUsersRepository.getEmailConfirmationByCodeOrId(
        code,
      );

    if (!emailConfirmation) {
      return false;
    }

    const isConfirmed = await this.jwtService.getTokenPayload(emailConfirmation.confirmationCode)

    if (!isConfirmed) {
      return false
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Confirmation code is not valid';
  }
}
