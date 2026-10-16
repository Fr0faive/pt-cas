import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PasswordService } from './common/password.service.js';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, PasswordService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return API info with Drizzle ORM and Bcrypt info', () => {
      const response = appController.getInfo();
      expect(response.success).toBe(true);
      expect(response.data.company).toContain('CAS');
      expect(response.data.orm).toContain('Drizzle');
    });

    it('should return health status', () => {
      const response = appController.getHealth();
      expect(response.success).toBe(true);
      expect(response.data.status).toBe('ok');
    });

    it('should verify bcrypt password hashing', async () => {
      const response = await appController.verifyPassword({ password: 'SecretPassword123' });
      expect(response.success).toBe(true);
      expect(response.data.matched).toBe(true);
      expect(response.data.algorithm).toBe('bcrypt');
    });
  });
});
