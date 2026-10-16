import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { DRIZZLE_DB, type DrizzleDb } from '../../drizzle/drizzle.provider.js';
import { msDistributor, msOutlet, msUser } from '../../drizzle/schema.js';
import { PasswordService } from '../../common/password.service.js';
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from '../../common/jwt-auth.guard.js';
import type {
  ApiResponse,
  AuthResponseData,
  AuthTokens,
  LoginDto,
  MsUserSafe,
  RefreshTokenDto,
  RegisterDto,
} from '@repo/shared';

interface JwtPayload {
  phoneNumber: string;
  userName: string;
  role: string;
  kodeOutlet?: string;
  kodeDistributor?: string;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: DrizzleDb,
    private readonly passwordService: PasswordService,
  ) {}

  private generateTokens(payload: JwtPayload): AuthTokens {
    const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ phoneNumber: payload.phoneNumber }, JWT_REFRESH_SECRET, {
      expiresIn: '7d',
    });
    return { accessToken, refreshToken };
  }

  async login(dto: LoginDto): Promise<ApiResponse<AuthResponseData>> {
    if (!dto?.phoneNumber?.trim() || !dto?.userPassword) {
      throw new BadRequestException({
        success: false,
        message: 'Nomor handphone dan password wajib diisi.',
        timestamp: new Date().toISOString(),
      });
    }

    const cleanPhone = dto.phoneNumber.trim();
    const [user] = await this.db.select().from(msUser).where(eq(msUser.phoneNumber, cleanPhone));

    if (!user) {
      throw new UnauthorizedException({
        success: false,
        message: 'Nomor handphone belum terdaftar. Silakan registrasi terlebih dahulu.',
        data: { isRegistered: false },
        timestamp: new Date().toISOString(),
      });
    }

    const isMatch = await this.passwordService.compare(dto.userPassword, user.userPassword);
    if (!isMatch) {
      throw new UnauthorizedException({
        success: false,
        message: 'Password yang Anda masukkan salah.',
        data: { isRegistered: true },
        timestamp: new Date().toISOString(),
      });
    }

    const userSafe: MsUserSafe = {
      phoneNumber: user.phoneNumber,
      userName: user.userName,
      kodeOutlet: user.kodeOutlet ?? '',
      kodeDistributor: user.kodeDistributor ?? '',
      role: user.role as MsUserSafe['role'],
      createdAt: user.createdAt.toISOString(),
    };

    const tokens = this.generateTokens({
      phoneNumber: user.phoneNumber,
      userName: user.userName,
      role: user.role,
      kodeOutlet: user.kodeOutlet ?? undefined,
      kodeDistributor: user.kodeDistributor ?? undefined,
    });

    return {
      success: true,
      message: 'Login berhasil',
      data: {
        user: userSafe,
        tokens,
        isRegistered: true,
      },
      timestamp: new Date().toISOString(),
    };
  }

  async register(dto: RegisterDto): Promise<ApiResponse<AuthResponseData>> {
    const cleanPhone = dto.phoneNumber.trim();
    if (!cleanPhone || !dto.userName.trim() || !dto.userPassword) {
      throw new BadRequestException('Semua field wajib diisi.');
    }

    const [existing] = await this.db.select().from(msUser).where(eq(msUser.phoneNumber, cleanPhone));
    if (existing) {
      throw new BadRequestException('Nomor handphone ini sudah terdaftar.');
    }

    const hashedPassword = await this.passwordService.hash(dto.userPassword);
    const role = dto.role === 'admin' ? 'admin' : 'customer';

    await this.db.insert(msUser).values({
      phoneNumber: cleanPhone,
      userName: dto.userName.trim(),
      userPassword: hashedPassword,
      kodeOutlet: dto.kodeOutlet || null,
      kodeDistributor: dto.kodeDistributor || null,
      role,
    });

    const userSafe: MsUserSafe = {
      phoneNumber: cleanPhone,
      userName: dto.userName.trim(),
      kodeOutlet: dto.kodeOutlet || '',
      kodeDistributor: dto.kodeDistributor || '',
      role,
      createdAt: new Date().toISOString(),
    };

    const tokens = this.generateTokens({
      phoneNumber: cleanPhone,
      userName: dto.userName.trim(),
      role,
      kodeOutlet: dto.kodeOutlet || undefined,
      kodeDistributor: dto.kodeDistributor || undefined,
    });

    return {
      success: true,
      message: 'Registrasi berhasil. Silakan login atau lanjut ke aplikasi.',
      data: {
        user: userSafe,
        tokens,
        isRegistered: true,
      },
      timestamp: new Date().toISOString(),
    };
  }

  async refresh(dto: RefreshTokenDto): Promise<ApiResponse<AuthTokens>> {
    if (!dto?.refreshToken) {
      throw new BadRequestException('Refresh token wajib disertakan.');
    }

    try {
      const decoded = jwt.verify(dto.refreshToken, JWT_REFRESH_SECRET) as { phoneNumber: string };
      const [user] = await this.db
        .select()
        .from(msUser)
        .where(eq(msUser.phoneNumber, decoded.phoneNumber));

      if (!user) {
        throw new UnauthorizedException('User dari token ini tidak ditemukan.');
      }

      const newTokens = this.generateTokens({
        phoneNumber: user.phoneNumber,
        userName: user.userName,
        role: user.role,
        kodeOutlet: user.kodeOutlet ?? undefined,
        kodeDistributor: user.kodeDistributor ?? undefined,
      });

      return {
        success: true,
        message: 'Token berhasil diperbarui.',
        data: newTokens,
        timestamp: new Date().toISOString(),
      };
    } catch {
      throw new UnauthorizedException('Refresh token tidak valid atau telah kedaluwarsa.');
    }
  }

  async getProfile(
    phoneNumber: string,
  ): Promise<ApiResponse<MsUserSafe & { outletName?: string; distributorName?: string }>> {
    const [user] = await this.db.select().from(msUser).where(eq(msUser.phoneNumber, phoneNumber));
    if (!user) {
      throw new BadRequestException('User tidak ditemukan.');
    }

    let outletName = '';
    let distributorName = '';

    if (user.kodeOutlet) {
      const [outlet] = await this.db
        .select()
        .from(msOutlet)
        .where(eq(msOutlet.kodeOutlet, user.kodeOutlet));
      outletName = outlet?.namaOutlet ?? '';
    }

    if (user.kodeDistributor) {
      const [dist] = await this.db
        .select()
        .from(msDistributor)
        .where(eq(msDistributor.kodeDistributor, user.kodeDistributor));
      distributorName = dist?.namaDistributor ?? '';
    }

    return {
      success: true,
      message: 'Profil user berhasil dimuat',
      data: {
        phoneNumber: user.phoneNumber,
        userName: user.userName,
        kodeOutlet: user.kodeOutlet ?? '',
        kodeDistributor: user.kodeDistributor ?? '',
        role: user.role as MsUserSafe['role'],
        createdAt: user.createdAt.toISOString(),
        outletName,
        distributorName,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
