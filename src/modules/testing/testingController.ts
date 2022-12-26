import { Controller, Delete, HttpCode } from '@nestjs/common';
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

@Controller('testing')
export class TestingController {
  constructor(@InjectDataSource() private dataSource: DataSource) {
  }

  @Delete('all-data')
  @HttpCode(204)
  async deleteAll() {
    await this.dataSource.query(`
      DELETE FROM users;
      DELETE FROM user_ban_info;
      DELETE FROM device_security;
      DELETE FROM email_confirmation;
      DELETE FROM token_black_list;
    `)
  }

  // @Delete('all-data')
  // @HttpCode(204)
  // async deleteAll() {
  //   await this.dataSource.query(`
  //     CREATE OR REPLACE FUNCTION truncate_tables(username in VARCHAR) RETURNS void AS $$
  //     DECLARE
  //     statements CURSOR FOR
  //      SELECT tablename FROM pg_tables
  //       WHERE tableowner = username AND schemaname = 'public';
  //       BEGIN
  //         FOR stmt IN statements LOOP
  //         EXECUTE 'TRUNCATE TABLE ' || quote_ident(stmt.tablename) || ' CASCADE;'
  //             END LOOP;
  //             END;
  //              $$ LANGUAGE plpgsql;
  //                 SELECT truncate_tables('postgres');
  //   `);

  //   return;
  // }

  // @Delete('all-data')
  // @HttpCode(204)
  // async deleteAll() {
  //   const collections = connection.collections;
  //
  //   for (const key in collections) {
  //     const collection = collections[key];
  //     await collection.deleteMany({});
  //   }
  // }
}
