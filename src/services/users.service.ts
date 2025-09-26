import bcrypt from 'bcryptjs';
import { LoginUserDto } from '../dto/login-user.dto';
import { RegisterUserDto } from '../dto/register-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { HttpError } from '../middleware/error-handler';
import { UserDocument, UserModel } from '../models/user';

const SALT_ROUNDS = 10;

export class UsersService {
  async register(payload: RegisterUserDto): Promise<UserResponseDto> {
    const normalizedEmail = payload.email.toLowerCase();
    const existingUser = await UserModel.exists({ email: normalizedEmail });

    if (existingUser) {
      throw new HttpError(409, 'Account already exists');
    }

    const hashedPassword = await bcrypt.hash(payload.password, SALT_ROUNDS);
    const user = await UserModel.create({
      email: normalizedEmail,
      name: payload.name,
      password: hashedPassword
    });

    return this.toResponse(user);
  }

  async login(payload: LoginUserDto): Promise<UserResponseDto> {
    const normalizedEmail = payload.email.toLowerCase();
    const user = await UserModel.findOne({ email: normalizedEmail })
      .select('+password')
      .exec();

    if (!user) {
      throw new HttpError(401, 'Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(payload.password, user.password);

    if (!isPasswordValid) {
      throw new HttpError(401, 'Invalid email or password');
    }

    return this.toResponse(user);
  }

  private toResponse(user: UserDocument): UserResponseDto {
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}
