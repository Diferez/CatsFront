import { NextFunction, Request, Response, Router } from 'express';
import { LoginUserDto } from '../dto/login-user.dto';
import { RegisterUserDto } from '../dto/register-user.dto';
import { validateBody } from '../middleware/validation.middleware';
import { UsersService } from '../services/users.service';

export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  register(router: Router): void {
    router.post('/users/register', validateBody(RegisterUserDto), this.registerUser);
    router.post('/users/login', validateBody(LoginUserDto), this.loginUser);
  }

  private registerUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = req.body as RegisterUserDto;
      const user = await this.usersService.register(payload);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  };

  private loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = req.body as LoginUserDto;
      const user = await this.usersService.login(payload);
      res.json(user);
    } catch (error) {
      next(error);
    }
  };
}
