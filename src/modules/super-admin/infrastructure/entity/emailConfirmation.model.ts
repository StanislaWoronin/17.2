export class EmailConfirmationModel {
  constructor(
    //public id: string,
    public confirmationCode: string,
    public isConfirmed: boolean,
  ) {}
}
