import { prisma } from '../lib';

export async function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}
