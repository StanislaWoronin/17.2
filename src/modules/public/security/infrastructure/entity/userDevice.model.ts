export class UserDeviceModel {
  constructor(
    public userId: string,
    public deviceId: string,
    public deviceTitle: string,
    public browser: string,
    public ipAddress: string,
    public iat: number,
    public exp: number,
  ) {}
}
