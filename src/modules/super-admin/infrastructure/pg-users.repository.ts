import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { InjectDataSource } from "@nestjs/typeorm";
import { UserDBModel } from "./entity/userDB.model";

@Injectable()
export class PgUsersRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {
  }

  async createUser(user: UserDBModel): Promise<UserDBModel | null> {
    console.log(user.id, 'user`s id from create user')
    try {
      await this.dataSource.query(`
        INSERT INTO public.users(id, login, email, password_hash, created_at, confirmation_code, is_confirmed)
          VALUES ('${user.id}', '${user.login}', '${user.email}', '${user.passwordHash}', '${user.createdAt}', '${user.confirmationCode}', '${user.isConfirmed}'); 
        `)
      return user
    } catch (e) {
      return null
    }
  }

  async updateConfirmationCode(
      userId: string,
      confirmationCode: string,
  ): Promise<boolean> {
    try {
      await this.dataSource.query(`
        UPDATE public.email_confirmation
           SET confirmation_code = '${confirmationCode}' // TODO если необязательный параметр не пришел не перезапишет ли на пустое значение
         WHERE id = '${userId}';
      `)
      return true
    } catch (e) {
      return false
    }
  }
}
