import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/Prisma/prsima.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client/wasm';
import { ConfigService } from '@nestjs/config';

// Definir interface para JWT payload correctamente
interface JwtPayload {
  id: string;
  role?: Role;
}

// Importar RefreshDto (asegúrate de que exista)
import { RefreshDto } from './dto/refresh.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {}

  async register(createUserDto: CreateUserDto) {
    try {
      // Verificar si el email ya existe
      const existingUser = await this.prisma.user.findUnique({
        where: { email: createUserDto.email }
      });

      if (existingUser) {
        throw new Error('El usuario con ese email ya existe');
      }

      const { password, ...userDto } = createUserDto;
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await this.prisma.user.create({
        data: {
          name: createUserDto.name || createUserDto.email, 
          email: createUserDto.email,
          password: hashedPassword,
          role: createUserDto.role || Role.EMPLEADO, // Usar valor específico del enum
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        }
      });

      return user;
    } catch (error) {
      throw new Error(`Error al crear el usuario: ${error.message}`);
    }
  }

  async login(loginDto: LoginDto) {
    const { password, usernameOrEmail } = loginDto;

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: usernameOrEmail },
        ],
      },
      select: {
        id: true,
        password: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException("Las credenciales no son válidas");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Las credenciales no son válidas");
    }

    const roleName = user.role;
    
    const accessToken = this.getJwtToken({ id: user.id.toString(), role: roleName });
    const refreshToken = this.getJwtToken({ id: user.id.toString() });

    return {
      userId: user.id,
      name: user.name,
      email: user.email,
      roleName,
      accessToken,
      refreshToken,
    };
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  async refreshToken(refreshDto: RefreshDto) {
    try {
      const payload = this.jwtService.verify(refreshDto.refreshToken, {
        secret: this.configService.get<string>("JWT_SECRET"),
      });
      
      const user = await this.prisma.user.findUnique({
        where: { id: parseInt(payload.id) },
        select: { email: true, id: true, role: true, name: true },
      });

      if (!user) throw new UnauthorizedException("Invalid refresh token");
      
      const accessToken = this.getJwtToken({ id: user.id.toString(), role: user.role });
      const refreshToken = this.getJwtToken({ id: user.id.toString() });

      return {
        userId: user.id,
        name: user.name,
        email: user.email,
        roleName: user.role,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }
}