import { publishUserCreated } from '../../../src/events/producers/user.producer';
import { createUser, getUserById, updateUser } from '../../../src/services/user.service';

// Mock dependencies
const mockCreate = jest.fn();
const mockFindUnique = jest.fn();
const mockUpdate = jest.fn();

jest.mock('../../../src/lib', () => ({
  prisma: {
    user: {
      create: (...args: any[]) => mockCreate(...args),
      findUnique: (...args: any[]) => mockFindUnique(...args),
      update: (...args: any[]) => mockUpdate(...args),
    },
  },
}));

jest.mock('../../../src/events/producers/user.producer', () => ({
  publishUserCreated: jest.fn(),
}));

describe('User Service', () => {
  const mockPublishUserCreated = publishUserCreated as jest.MockedFunction<typeof publishUserCreated>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a user and publish event', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      };

      const mockUser = {
        id: 'user-123',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      mockCreate.mockResolvedValue(mockUser as any);
      mockPublishUserCreated.mockResolvedValue(undefined);

      const result = await createUser(userData);

      expect(mockCreate).toHaveBeenCalledWith({
        data: {},
      });
      expect(mockPublishUserCreated).toHaveBeenCalledWith({
        userId: 'user-123',
      });
      expect(result).toEqual({
        id: 'user-123',
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });

    it('should handle Prisma errors', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      };

      mockCreate.mockRejectedValue(new Error('Database error'));

      await expect(createUser(userData)).rejects.toThrow('Database error');
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const mockUser = {
        id: 'user-123',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      mockFindUnique.mockResolvedValue(mockUser as any);

      const result = await getUserById('user-123');

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      expect(result).toEqual({
        id: 'user-123',
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });

    it('should throw error when user not found', async () => {
      mockFindUnique.mockResolvedValue(null);

      await expect(getUserById('non-existent')).rejects.toThrow('User not found');
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const mockUser = {
        id: 'user-123',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      const updateData = {
        name: 'Updated Name',
      };

      mockUpdate.mockResolvedValue(mockUser as any);

      const result = await updateUser('user-123', updateData);

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {},
      });
      expect(result).toEqual({
        id: 'user-123',
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });

    it('should handle Prisma errors', async () => {
      mockUpdate.mockRejectedValue(new Error('Database error'));

      await expect(updateUser('user-123', {})).rejects.toThrow('Database error');
    });
  });
});
