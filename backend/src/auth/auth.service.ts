import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(mail: string, password: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { mail },
    });

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const passwordValida = await bcrypt.compare(
      password,
      usuario.passwordHash,
    );

    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const payload = {
      sub: usuario.id,
      rol: usuario.rol,
    };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = randomUUID();

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    await this.prisma.refreshToken.create({
      data: {
        token: refreshTokenHash,
        usuarioId: usuario.id,
        expiraEn: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000,
        ),
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    const tokens = await this.prisma.refreshToken.findMany({
      where: {
        revocado: false,
      },
      include: {
        usuario: true,
      },
    });

    for (const token of tokens) {
      const match = await bcrypt.compare(
        refreshToken,
        token.token,
      );

      if (match && token.expiraEn > new Date()) {
        const payload = {
          sub: token.usuario.id,
          rol: token.usuario.rol,
        };

        const newAccessToken = this.jwtService.sign(payload);

        return { accessToken: newAccessToken };
      }
    }

    throw new UnauthorizedException('Refresh token inválido');
  }
}