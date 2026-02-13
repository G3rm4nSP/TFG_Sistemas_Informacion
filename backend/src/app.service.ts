import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  helpMessage(): string {
    return 'Welcome to the ERP-RPI backend! Available endpoints: /users, /products, /sales, /auth ';
  }

}
