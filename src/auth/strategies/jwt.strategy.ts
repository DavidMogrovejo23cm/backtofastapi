// src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from 'jsonwebtoken';
import { PrismaService } from 'src/Prisma/prsima.service';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key', // Use environment variable
    });
  }

  async validate(payload: JwtPayload) {
    // Validate the user exists in the database
    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, role: true }, // Only select necessary fields
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}