export class UserDBModel {
  constructor(
    public id: string,
    public login: string,
    public email: string,
    public passwordHash: string,
    public createdAt: string,
    public confirmationCode: string | null,
    public isConfirmed: boolean
  ) {}
}
