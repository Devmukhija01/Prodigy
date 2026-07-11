// import { Request, Response } from 'express';
// import { User } from '../models/User';

// // Search user by regid
// export const searchUserByRegisterId = async (req: Request, res: Response) => {
//   const { registerId,email } = req.query;

//   if (!registerId || typeof registerId !== 'string')  {
//     return res.status(400).json({ message: 'registerId is required' });
//   }

//   try {
//     const user = await User.findOne({ registerId }).select('-password');

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     const fullName = `${user.firstName} ${user.lastName}`.trim();

//     res.status(200).json({
//       id: user._id,
//       username: user.registerId,
//       fullName,
//       email: user.email,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };
import { Request, Response } from 'express';
import { User } from '../models/User';

// Search user by Register ID OR Email
export const searchUserByRegisterId = async (req: Request, res: Response) => {
  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ message: 'Search value is required' });
  }

  try {
    const isEmail = q.includes('@');

    const user = await User.findOne(
      isEmail
        ? { email: q.toLowerCase() }
        : { registerId: q }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();

    return res.status(200).json({
      id: user._id,
      registerId: user.registerId,
      fullName,
      email: user.email,
    });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
