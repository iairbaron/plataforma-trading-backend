import prisma from '../prisma';

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({ where: { email } });
}; 