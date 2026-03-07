import * as userRepository from '../repositories/user.repository';
import { UserWithProfilePicture } from '../repositories/user.repository';

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
  return await userRepository.getUserById(id);
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
