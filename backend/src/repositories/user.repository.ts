import { type Prisma } from '@prisma/client';
import prisma from '@lib/prisma';

export type UserWithProfilePicture = Prisma.UserGetPayload<{
  include: { profilePicture: true };
}>;

export async function getUserByGoogleId(googleId?: string): Promise<UserWithProfilePicture | null> {
  if (!googleId) {
    return null;
  }
  return await prisma.user.findFirst({
    where: {
      googleId: googleId,
    },
    include: {
      profilePicture: true,
    },
  });
}

export async function createUser(
  name: string,
  email?: string,
  googleId?: string,
  profilePictureUrl?: string,
): Promise<UserWithProfilePicture> {
  return await prisma.user.create({
    data: {
      name: name,
      email: email,
      googleId: googleId,
      profilePicture: profilePictureUrl
        ? {
            create: {
              imageUrl: profilePictureUrl,
            },
          }
        : undefined,
    },
    include: {
      profilePicture: true,
    },
  });
}

export async function getUserById(id: string): Promise<UserWithProfilePicture | null> {
  return await prisma.user.findFirst({
    where: {
      id: id,
    },
    include: {
      profilePicture: true,
    },
  });
}

export async function getAllUsers(): Promise<UserWithProfilePicture[]> {
  return await prisma.user.findMany({
    include: {
      profilePicture: true,
    },
  });
}

export async function updateUserById(
  id: string,
  name?: string,
  email?: string,
  googleId?: string,
  profilePictureUrl?: string,
): Promise<UserWithProfilePicture> {
  return await prisma.user.update({
    where: { id },
    data: {
      name,
      email,
      googleId,
      profilePicture: profilePictureUrl
        ? {
            upsert: {
              create: {
                imageUrl: profilePictureUrl,
              },
              update: {
                imageUrl: profilePictureUrl,
              },
            },
          }
        : undefined,
    },
    include: {
      profilePicture: true,
    },
  });
}

export async function deleteUserById(id: string) {
  return await prisma.user.delete({
    where: { id },
  });
}

export async function getUserProfile(id: string) {
  return await prisma.user.findFirst({
    where: {
      id: id,
    },
    select: {
      id: true,
      name: true,
      profilePicture: {
        select: {
          imageUrl: true,
        },
      },
    },
  });
}
