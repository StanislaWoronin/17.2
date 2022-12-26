import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthBasicGuard } from '../../../guards/auth.basic.guard';
import { UsersService } from '../application/users.service';
import { QueryParametersDto } from '../../../global-model/query-parameters.dto';
import { UserDTO } from './dto/userDTO';
import { UserViewModel } from './dto/userView.model';
import { BanUserDto } from './dto/ban-user.dto';
import { CreateUserBySaUseCase } from '../use-cases/create-user-by-sa.use-case';
import {PgQueryUsersRepository} from "../infrastructure/pg-query-users.repository";

@UseGuards(AuthBasicGuard)
@Controller('sa/users')
export class UsersController {
  constructor(
    protected usersService: UsersService,
    protected createUserUseCase: CreateUserBySaUseCase,
    protected queryUsersRepository: PgQueryUsersRepository,
  ) {}

  @Get()
  getUsers(
      @Query()
          query: QueryParametersDto,
  ) {
    return this.queryUsersRepository.getUsers(query);
  }

  @Post()
  async createUser(@Body() dto: UserDTO): Promise<UserViewModel> {
    const emailConfirmation = await this.createUserUseCase.execute()
    const result = await this.usersService.createUser(dto, emailConfirmation);

    return result.user;
  }

  @Put(':userId/ban')
  @HttpCode(204)
  async updateBanStatus(
      @Body() dto: BanUserDto,
      @Param('userId') userId: string,
  ) {
    return await this.usersService.updateBanStatus(userId, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteUsersById(@Param('id') userId: string) {
    const result = await this.queryUsersRepository.deleteUserById(userId);

    if (!result) {
      throw new NotFoundException();
    }

    return;
  }
}
