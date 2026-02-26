import { prisma } from "../../config/db";

export const createUser = async (email: string, name?: string) => {
  return prisma.user.create({
    data: {
      email,
      name: name ?? null,
    },
  });
};

export const getUsers = async () => {
  return prisma.user.findMany({ include: { jobs: true } });
};
