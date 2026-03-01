import * as userService from '../services/user.service';
import { Request, Response } from 'express';

export const createOrGetGoogleUser = async (req: Request, res: Response) => {
  const { name, email, googleId, profilePictureUrl } = req.body;
  const user = await userService.createOrGetGoogleUser(
    name,
    email,
    googleId,
    profilePictureUrl
  );
  if (!user) {
    return res.status(500).json({ error: 'Failed to create user' });
  }
  return res.status(201).json(user);
};
