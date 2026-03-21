import { NotFoundError } from '@errors/app-error';
import * as userRepository from '@repositories/user.repository';
import { UserWithProfilePicture } from '@repositories/user.repository';
import { UserProfile } from '@shared/user.types';

export async function createOrGetGoogleUser(
  googleId: string,
  name: string,
  email?: string,
  profilePictureUrl?: string
): Promise<UserWithProfilePicture> {
  let user = await userRepository.getUserByGoogleId(googleId);

  if (user) {
    return user;
  }

  user = await userRepository.createUser(
    name,
    email,
    googleId,
    profilePictureUrl
  );

  return user;
}

export async function getUserById(
  id: string
): Promise<UserWithProfilePicture | null> {
  const user = await userRepository.getUserById(id);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return user;
}

export async function getAllUsers(): Promise<UserWithProfilePicture[]> {
  return await userRepository.getAllUsers();
}

export async function updateUserById(
  id: string,
  name?: string,
  email?: string,
  googleId?: string,
  profilePictureUrl?: string
): Promise<UserWithProfilePicture> {
  return await userRepository.updateUserById(
    id,
    name,
    email,
    googleId,
    profilePictureUrl
  );
}

export async function deleteUserById(id: string) {
  return await userRepository.deleteUserById(id);
}

export async function getUserProfile(id: string): Promise<UserProfile> {
  const userProfile = await userRepository.getUserProfile(id);

  if (!userProfile) {
    throw new NotFoundError('User not found');
  }

  return {
    id: userProfile.id,
    name: userProfile.name,
    profilePicture: userProfile.profilePicture?.imageUrl,
  };
}
