import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { generateRegisterId } from '../utils/generateId';
import jwt from 'jsonwebtoken';
export const register = async (req: Request, res: Response) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const registerId = generateRegisterId();

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      registerId,
    });

    await newUser.save();
    res.status(201).json({ message: 'Registration successful', registerId });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error });
  }
};



export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.password) {
      return res.status(500).json({ message: "User record is corrupted: password missing" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    // ✅ Create JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '7d' });

    // ✅ Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",  // or "None" if using HTTPS cross-site
      secure: false     // true if using HTTPS
    });

    // ✅ Send success response
    const responseData = { 
      message: 'Login successful', 
      registerId: user.registerId,
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar
      }
    };
    
    res.status(200).json(responseData);

  } catch (error) {
    res.status(500).json({ message: 'Login failed', error });
  }
};
