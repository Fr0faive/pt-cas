import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';

@Injectable()
export class PasswordService {
  private readonly defaultSaltRounds = 10;

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.defaultSaltRounds);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
