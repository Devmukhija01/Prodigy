import express from "express";
import { requireAuth, AuthenticatedRequest } from "../Middleware/auth";
import { User } from "../models/User";
import { searchUserByRegisterId } from '../controllers/userController';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'avatars');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

router.get('/search', searchUserByRegisterId);

// Get all users (for member selection)
router.get('/', requireAuth, async (req, res) => {
  try {
    const users = await User.find({}, 'firstName lastName email avatar registerId').lean();
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get current user's friends
router.get('/friends', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const user = await User.findById(req.user?.id).populate('friends', 'firstName lastName email avatar registerId').lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user.friends || []);
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Debug endpoint to check user data
router.get("/debug/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    console.log("🔧 Debug: User data from database:", user.toObject());
    res.json(user.toObject());
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error });
  }
});

// GET /api/user/me
router.get("/me", requireAuth, async (req: AuthenticatedRequest, res) => {
    const user = await User.findById(req.user?.id).select("firstName lastName email registerId avatar phone bio socialAccounts");
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // Avatar is already stored as full URL, no conversion needed
    const userData = user.toObject();
    res.json(userData);
  });

// PUT /api/user/me
router.put("/me", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { firstName, lastName, email, registerId, phone, bio, socialAccounts } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ message: "First name, last name, and email are required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user?.id,
      { firstName, lastName, email, registerId, phone, bio, socialAccounts },
      { new: true, runValidators: true }
    ).select("firstName lastName email registerId avatar phone bio socialAccounts");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Avatar is already stored as full URL, no conversion needed
    const userData = updatedUser.toObject();

    res.json(userData);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: "Error updating user" });
  }
});

// POST /api/user/upload-avatar
router.post("/upload-avatar", requireAuth, upload.single('avatar'), async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Generate the avatar URL with full backend URL
    const avatarUrl = `http://https://prodigy-59mg.onrender.com/uploads/avatars/${req.file.filename}`;



    // Update user's avatar in database
    const updatedUser = await User.findByIdAndUpdate(
      req.user?.id,
      { avatar: avatarUrl },
      { new: true }
    ).select("firstName lastName email registerId avatar phone bio socialAccounts");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ 
      message: "Avatar uploaded successfully",
      avatarUrl: avatarUrl,
      user: updatedUser
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ message: "Error uploading avatar" });
  }
});

// POST /api/user/crop-avatar
router.post("/crop-avatar", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { imageUrl, cropY } = req.body;

    if (!imageUrl || cropY === undefined) {
      return res.status(400).json({ message: "Image URL and crop position are required" });
    }

    // Extract filename from the image URL
    const urlParts = imageUrl.split('/');
    const filename = urlParts[urlParts.length - 1];
    const imagePath = path.join(process.cwd(), 'uploads', 'avatars', filename);

    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ message: "Image file not found" });
    }

    // Read the image and get its metadata
    const image = sharp(imagePath);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      return res.status(400).json({ message: "Invalid image metadata" });
    }

    // Calculate crop dimensions
    const size = Math.min(metadata.width, metadata.height);
    const cropX = Math.floor((metadata.width - size) / 2);
    const adjustedCropY = Math.max(0, Math.min(metadata.height - size, cropY));

    // Generate new filename for cropped image
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const newFilename = 'avatar-cropped-' + uniqueSuffix + path.extname(filename);
    const outputPath = path.join(process.cwd(), 'uploads', 'avatars', newFilename);

    // Crop and resize the image
    await image
      .extract({
        left: cropX,
        top: adjustedCropY,
        width: size,
        height: size
      })
      .resize(200, 200, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 90 })
      .toFile(outputPath);

    // Generate new avatar URL
    const newAvatarUrl = `http://https://prodigy-59mg.onrender.com/uploads/avatars/${newFilename}`;

    // Update user's avatar in database
    const updatedUser = await User.findByIdAndUpdate(
      req.user?.id,
      { avatar: newAvatarUrl },
      { new: true }
    ).select("firstName lastName email registerId avatar phone bio socialAccounts");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ 
      message: "Avatar cropped successfully",
      avatarUrl: newAvatarUrl,
      user: updatedUser
    });

  } catch (error) {
    console.error('Avatar crop error:', error);
    res.status(500).json({ message: "Error cropping avatar" });
  }
});

export default router;
