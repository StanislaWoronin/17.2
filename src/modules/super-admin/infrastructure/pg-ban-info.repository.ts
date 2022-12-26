import { Injectable } from "@nestjs/common";
import { BanInfoModel } from "./entity/banInfo.model";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

@Injectable()
export class PgBanInfoRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {
  }

  async getBanInfo(userId: string): Promise<BanInfoModel | null> {
    return await this.dataSource.query(`
      SELECT user_id as "userId", ban_status as "isBanned", ban_date as "banDate", ban_reason as "banReason", blog_id as "blogId"
        FROM public.user_ban_info
       WHERE user_id = '${userId}';
    `)
  }

  async createBanInfo(banInfo: BanInfoModel): Promise<BanInfoModel | null> {
    console.log(banInfo);
    try {
     await this.dataSource.query(`
        INSERT INTO public.user_ban_info
          (user_id, ban_status, ban_reason, ban_date, blog_id)
          VALUES ('${banInfo.parentId}', '${banInfo.isBanned}', null, null, null);`)
      return banInfo
    } catch (e) {
      return null
    }
  }

  async saUpdateBanStatus(userId: string, banStatus: boolean, banReason: string, banDate: Date): Promise<boolean> {
    try {
      await this.dataSource.query(`
        UPDATE public.user_ban_info
           SET ban_status = '${banStatus}', ban_date = '${banDate}', ban_reason" = '${banReason}'
         WHERE user_id = '${userId}';
      `)
      return true
    } catch (e) {
      return false
    }
  }

  async deleteBanInfoById(userId: string): Promise<boolean> {
    try {
      await this.dataSource.query(`
        DELETE FROM public.user_ban_info
         WHERE user_id = '${userId}';
      `)
      return true
    } catch (e) {
      return false
    }
  }
}