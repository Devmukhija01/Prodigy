import { Request, Response } from "express";
import { User, FriendRequest } from "../models/User"; // FriendRequest is now exported from User.ts
import { AuthenticatedRequest } from "../Middleware/auth";

// Send a friend request by MongoDB user _id
export const sendFriendRequest = async (req: AuthenticatedRequest, res: Response) => {
  const { toUserId } = req.body;
  const fromUserId = req.user?.id;
  if (!fromUserId) return res.status(401).json({ message: "Unauthorized" });
  if (!toUserId) return res.status(400).json({ message: "Missing toUserId" });
  console.log("Sending friend request from", fromUserId, "to", toUserId);
  try {
    const fromUser = await User.findById(fromUserId);
    const toUser = await User.findById(toUserId);

    if (!fromUser || !toUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if a request already exists
    const existingRequest = await FriendRequest.findOne({
      fromUser: fromUserId,
      toUser: toUserId,
      status: 'pending',
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Friend request already sent" });
    }

    const newRequest = new FriendRequest({
      fromUser: fromUserId,
      toUser: toUserId,
      status: 'pending',
    });

    await newRequest.save();
    res.status(200).json(newRequest);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// Get all pending requests for a user
export const getPendingRequests = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  console.log("Getting pending requests for", userId);
  try {
    const requests = await FriendRequest.find({ toUser: userId, status: "pending" })
      .populate("fromUser", "firstName lastName registerId email")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// Accept or reject a friend request
export const updateFriendRequestStatus = async (req: AuthenticatedRequest, res: Response) => {
  const { requestId } = req.params;
  const { status } = req.body;
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  if (!['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }
    if (friendRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Request already handled' });
    }
    // Only the recipient can accept/reject
    if (friendRequest.toUser.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to act on this request' });
    }
    
    friendRequest.status = status;
    await friendRequest.save();

    // If accepted, create friendship for both users
    if (status === 'accepted') {
      // Add to both users' friends arrays
      await User.findByIdAndUpdate(
        friendRequest.fromUser,
        { $addToSet: { friends: friendRequest.toUser } }
      );
      await User.findByIdAndUpdate(
        friendRequest.toUser,
        { $addToSet: { friends: friendRequest.fromUser } }
      );
    }

    res.status(200).json({ message: `Friend request ${status}` });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// Get friends for a user
export const getFriends = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  console.log("Getting friends for", userId);
  try {
    const user = await User.findById(userId).populate('friends', 'firstName lastName registerId email avatar');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const friends = user.friends || [];
    res.status(200).json(friends);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// Debug: Get all friend requests in database
export const getAllFriendRequests = async (req: Request, res: Response) => {
  try {
    const allRequests = await FriendRequest.find({})
      .populate('fromUser', 'firstName lastName registerId email')
      .populate('toUser', 'firstName lastName registerId email')
      .sort({ createdAt: -1 });
    
    console.log('All friend requests in database:', allRequests);
    res.status(200).json({ 
      count: allRequests.length, 
      requests: allRequests 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};
export const getAcceptedFriends = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Use the correct schema fields: fromUser & toUser
    const acceptedRequests = await FriendRequest.find({
      $or: [{ fromUser: userId }, { toUser: userId }],
      status: "accepted",
    })
      .populate("fromUser", "firstName lastName registerId email")
      .populate("toUser", "firstName lastName registerId email");

    // Extract only the *other* user (the friend)
    const friends = acceptedRequests.map((req) =>
      req.fromUser._id.toString() === userId ? req.toUser : req.fromUser
    );

    res.json(friends);
  } catch (error) {
    res.status(500).json({ message: "Error fetching accepted friends", error });
  }
};
