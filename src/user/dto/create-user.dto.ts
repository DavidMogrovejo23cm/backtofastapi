import { ApiProperty } from "@nestjs/swagger";
import { Role } from "@prisma/client/wasm";
import { 
  IsEmail, 
  IsEnum, 
  IsOptional, 
  IsString,
  IsBoolean,
  MinLength,
  MaxLength
} from "class-validator";

export class CreateUserDto {
  @ApiProperty({ example: 'johndoe' })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ 
    example: 'USER',
    enum: Role,
    enumName: 'Role'
  })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}