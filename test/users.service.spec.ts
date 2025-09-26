import bcrypt from 'bcryptjs';
import { UsersService } from '../src/services/users.service';

const existsMock = jest.fn();
const createMock = jest.fn();
const findOneMock = jest.fn();

jest.mock('../src/models/user', () => ({
  UserModel: {
    exists: (...args: unknown[]) => existsMock(...args),
    create: (...args: unknown[]) => createMock(...args),
    findOne: (...args: unknown[]) => findOneMock(...args)
  }
}));

describe('UsersService', () => {
  const service = new UsersService();

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('register', () => {
    it('hashes the password and stores the user', async () => {
      existsMock.mockResolvedValue(null);
      const hashSpy = jest.spyOn(bcrypt, 'hash').mockImplementation(async () => 'hashed-password');
      const userDoc = {
        _id: { toString: () => 'user-id' },
        email: 'user@example.com',
        name: 'User',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-02T00:00:00Z')
      } as const;
      createMock.mockResolvedValue(userDoc);

      const payload = { email: 'USER@example.com', password: 'Password123', name: 'User' };
      const result = await service.register(payload);

      expect(existsMock).toHaveBeenCalledWith({ email: 'user@example.com' });
      expect(hashSpy).toHaveBeenCalledWith('Password123', 10);
      expect(createMock).toHaveBeenCalledWith({
        email: 'user@example.com',
        name: 'User',
        password: 'hashed-password'
      });
      expect(result).toEqual({
        id: 'user-id',
        email: 'user@example.com',
        name: 'User',
        createdAt: userDoc.createdAt,
        updatedAt: userDoc.updatedAt
      });
    });

    it('throws when the email already exists', async () => {
      existsMock.mockResolvedValue({ _id: 'existing-id' });

      await expect(
        service.register({ email: 'user@example.com', password: 'Password123', name: 'User' })
      ).rejects.toMatchObject({ status: 409, message: 'Account already exists' });

      expect(createMock).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const buildQueryMock = (user: unknown) => {
      const exec = jest.fn().mockResolvedValue(user);
      return {
        select: jest.fn().mockReturnThis(),
        exec
      };
    };

    it('validates credentials and returns the sanitized user', async () => {
      const userDoc = {
        _id: { toString: () => 'user-id' },
        email: 'user@example.com',
        name: 'User',
        password: 'hashed-password',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-02T00:00:00Z')
      };
      const query = buildQueryMock(userDoc);
      findOneMock.mockReturnValue(query);
      const compareSpy = jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);

      const result = await service.login({ email: 'USER@example.com', password: 'Password123' });

      expect(findOneMock).toHaveBeenCalledWith({ email: 'user@example.com' });
      expect(query.select).toHaveBeenCalledWith('+password');
      expect(compareSpy).toHaveBeenCalledWith('Password123', 'hashed-password');
      expect(result).toEqual({
        id: 'user-id',
        email: 'user@example.com',
        name: 'User',
        createdAt: userDoc.createdAt,
        updatedAt: userDoc.updatedAt
      });
    });

    it('throws when the user is not found', async () => {
      const query = buildQueryMock(null);
      findOneMock.mockReturnValue(query);

      await expect(service.login({ email: 'user@example.com', password: 'Password123' })).rejects.toMatchObject({
        status: 401,
        message: 'Invalid email or password'
      });
    });

    it('throws when the password is invalid', async () => {
      const userDoc = {
        _id: { toString: () => 'user-id' },
        email: 'user@example.com',
        name: 'User',
        password: 'hashed-password'
      };
      const query = buildQueryMock(userDoc);
      findOneMock.mockReturnValue(query);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

      await expect(service.login({ email: 'user@example.com', password: 'Password123' })).rejects.toMatchObject({
        status: 401,
        message: 'Invalid email or password'
      });
    });
  });
});
