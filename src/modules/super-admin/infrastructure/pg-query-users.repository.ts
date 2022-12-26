import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { QueryParametersDto } from "../../../global-model/query-parameters.dto";
import { UserViewModelWithBanInfo } from "../api/dto/userView.model";
import {giveSkipNumber, paginationContentPage} from "../../../helper.functions";
import { UserDBModel } from "./entity/userDB.model";
import {ContentPageModel} from "../../../global-model/contentPage.model";
import {EmailConfirmationModel} from "./entity/emailConfirmation.model";

@Injectable()
export class PgQueryUsersRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {
  }

  async getUserByLoginOrEmail(loginOrEmail: string): Promise<UserDBModel | null> {
    const result = await this.dataSource.query(`
        SELECT id, login, email, password_hash as "passwordHash", password_salt as "passwordSalt", created_at as "createdAt"
          FROM public.users
         WHERE login = '${loginOrEmail}' OR email = '${loginOrEmail}'
    `)

    return result[0]
  }

  async getUserById(id: string):Promise<UserDBModel | null> {
    const result = await this.dataSource.query(`
        SELECT id, login, email, password_hash as "passwordHash", password_salt as "passwordSalt", created_at as "createdAt"
          FROM public.users
         WHERE id = '${id}';
    `)

    return result[0]
  }

  async getUsers(query: QueryParametersDto): Promise<ContentPageModel> {
    const usersDB = await this.dataSource.query(`
      SELECT id, login, email, created_at,
          (SELECT ban_status as "isBanned" FROM public.user_ban_info WHERE id = user_id),
          (SELECT ban_date as "banDate" FROM public.user_ban_info WHERE id = user_id),
          (SELECT ban_reason as "banReason" FROM public.user_ban_info WHERE id = user_id)
        FROM public.users
       WHERE ban_status = '${query.banStatus}'
         AND login LIKE '%${query.searchLoginTerm}%' 
         AND email LIKE '%${query.searchEmailTerm}%'
       ORDER BY ${query.sortBy} ${query.sortDirection} 
       LIMIT ${query.pageSize} OFFSET ${giveSkipNumber(query.pageNumber, query.pageSize)};
    `)

    const users = usersDB.map(u => {
      return {
        id: u.id,
        login: u.login,
        email: u.email,
        createdAt: u.createdAt,
        banInfo: {
          isBanned: u.isBanned,
          banDate: u.banDate,
          banReason: u.banReason
        }
      }
    })

    const totalCount = await this.dataSource.query(`
     SELECT id
       FROM public.users
      WHERE ban_status = ${query.banStatus}
        AND login LIKE '%${query.searchLoginTerm}%' 
        AND email LIKE '%${query.searchEmailTerm}%';
    `)

    return paginationContentPage(
        query.pageNumber,
        query.pageSize,
        users,
        totalCount,
    );
  }

  async getEmailConfirmationByCodeOrId(
      codeOrId: string,
  ): Promise<EmailConfirmationModel | null> {
    return await this.dataSource.query(`
      SELECT confirmation_code as "confirmationCode", is_confirmed as "isConfirmed"
        FROM public.users
       WHERE id = '${codeOrId}' OR confirmation_code = '${codeOrId}';
    `)
  }

  async checkConfirmation(userId: string): Promise<boolean | null> {
    try {
      const result = await this.dataSource.query(`
        SELECT is_confirmed
          FROM public.email_confirmation;
         WHERE id = '${userId}'
      `)

      if (!result) {
        return false
      }
      return true
    } catch (e) {
      return null
    }
  }

  async updateConfirmationInfo(confirmation_code: string): Promise<boolean> {
    try {
      await this.dataSource.query(`
        UPDATE public.users
           SET is_confirmed = true
         WHERE confirmation_code = '${confirmation_code}';
      `)
    } catch (e) {
      return false
    }
  }

  async deleteUserById(userId: string): Promise<boolean> {
    try {
      await this.dataSource.query(`
        DELETE FROM public.users
         WHERE id = ${userId};
      `)
      return true // скорее всего вне зависимости от результата операции вернет true
    } catch (e) {
      return false
    }
  }
}