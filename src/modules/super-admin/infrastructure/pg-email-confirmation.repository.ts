import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { EmailConfirmationModel } from "./entity/emailConfirmation.model";

@Injectable()
export class PgEmailConfirmationRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {
  }

  async getEmailConfirmationByCodeOrId(
    codeOrId: string,
  ): Promise<EmailConfirmationModel | null> {
    return await this.dataSource.query(`
      SELECT user_id as "userId", confirmation_code as "confirmationCode", expiration_date as "expirationDate", is_confirmed as "isConfirmed"
        FROM public.email_confirmation
       WHERE user_id = '${codeOrId}' OR confirmation_code = '${codeOrId}';
    `)
  }

  async checkConfirmation(userId: string): Promise<boolean | null> {
    try {
      const result = await this.dataSource.query(`
        SELECT is_confirmed
          FROM public.email_confirmation;
         WHERE user_id = '${userId}'
      `)

      if (!result) {
        return null
      }

      return true
    } catch (e) {
      return false
    }
  }

}