import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '../prisma/prisma.service';

import * as bcrypt from 'bcrypt';

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
      throw new UnauthorizedException(
        'Credenciales incorrectas',
      );
    }

    const passwordValida = await bcrypt.compare(
      password,
      usuario.passwordHash,
    );

    if (!passwordValida) {
      throw new UnauthorizedException(
        'Credenciales incorrectas',
      );
    }

    const payload = {
      sub: usuario.id,
      rol: usuario.rol,
    };

    // Access token corto
    const accessToken = this.jwtService.sign(
      payload,
      {
        expiresIn: '15m',
      },
    );

    // Refresh token largo
    const refreshToken = this.jwtService.sign(
      payload,
      {
        expiresIn: '7d',
      },
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload =
        this.jwtService.verify(refreshToken);

      const newPayload = {
        sub: payload.sub,
        rol: payload.rol,
      };

      const accessToken = this.jwtService.sign(
        newPayload,
        {
          expiresIn: '15m',
        },
      );

      return {
        accessToken,
      };

    } catch {
      throw new UnauthorizedException(
        'Refresh token inválido',
      );
    }
  }
}