import express from 'express';
import { requireAuth, AuthenticatedRequest } from '../Middleware/auth';
import { JoinRequest, Group, User } from '../models/User';

const router = express.Router();

// Get join requests for groups owned by a user
router.get('/owner/:userId', requireAuth, async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('Fetching join requests for groups owned by user:', userId);
    
    const joinRequests = await JoinRequest.find({
      groupId: { $in: await Group.find({ ownerId: userId }).distinct('_id') }
    }).populate({
      path: 'userId',
      select: 'firstName lastName email avatar'
    }).populate({
      path: 'groupId',
      select: 'name description ownerId members isPrivate',
      populate: {
        path: 'ownerId',
        select: 'firstName lastName email avatar'
      }
    });
    
    console.log('Owner join requests found:', joinRequests.length);
    joinRequests.forEach((request, index) => {
      console.log(`Owner Join Request ${index}:`, {
        id: request._id,
        userId: request.userId,
        groupId: request.groupId,
        status: request.status,
        user: request.user,
        group: request.group
      });
    });
    
    res.json(joinRequests);
  } catch (error) {
    console.error('Get join requests error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update join request status
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log('Updating join request:', id, 'to status:', status);
    
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const joinRequest = await JoinRequest.findById(id);
    if (!joinRequest) {
      return res.status(404).json({ message: 'Join request not found' });
    }
    
    console.log('Found join request:', joinRequest);
    
    // If accepted, add user to group members
    if (status === 'accepted') {
      console.log('Adding user to group members:', joinRequest.userId, 'to group:', joinRequest.groupId);
      
      const updatedGroup = await Group.findByIdAndUpdate(
        joinRequest.groupId,
        { $addToSet: { members: joinRequest.userId } },
        { new: true }
      );
      
      console.log('Group updated:', updatedGroup);
      
      // Also update the join request status to accepted
      joinRequest.status = status;
      await joinRequest.save();
    } else {
      // For rejected requests, just update the status
      joinRequest.status = status;
      await joinRequest.save();
    }
    
    res.json({ message: `Join request ${status}` });
  } catch (error) {
    console.error('Update join request error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get join requests for a specific user
router.get('/user/:userId', requireAuth, async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('Fetching join requests for user:', userId);
    
    // First, let's check if there are any join requests at all
    const allJoinRequests = await JoinRequest.find({}).lean();
    console.log('Total join requests in database:', allJoinRequests.length);
    
    // Check if there are any join requests for this user (any status)
    const userJoinRequestsAnyStatus = await JoinRequest.find({ userId: userId }).lean();
    console.log('Join requests for user (any status):', userJoinRequestsAnyStatus.length);
    
    // Now get the pending ones with full group and owner details
    const joinRequests = await JoinRequest.find({
      userId: userId,
      status: 'pending'
    }).populate({
      path: 'groupId',
      select: 'name description ownerId members isPrivate',
      populate: {
        path: 'ownerId',
        select: 'firstName lastName email avatar'
      }
    }).lean();
    
    console.log('Join requests with populated data:', joinRequests);
    
    // Debug: Log each join request to see what data we have
    joinRequests.forEach((request, index) => {
      console.log(`Join Request ${index}:`, {
        id: request._id,
        userId: request.userId,
        groupId: request.groupId,
        status: request.status,
        group: request.group,
        groupName: request.group?.name,
        groupDescription: request.group?.description,
        groupOwner: request.group?.ownerId,
        hasGroup: !!request.group
      });
    });
    
    console.log('Found pending join requests:', joinRequests.length);
    res.json(joinRequests);
  } catch (error) {
    console.error('Get user join requests error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Test route to manually create a join request (for debugging)
router.post('/test-create', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { userId, groupId } = req.body;
    
    console.log('Creating test join request for user:', userId, 'to group:', groupId);
    
    // First verify the group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    console.log('Found group:', group.name);
    
    const joinRequest = new JoinRequest({
      userId: userId,
      groupId: groupId,
      status: 'pending'
    });
    
    const savedRequest = await joinRequest.save();
    console.log('Test join request created:', savedRequest);
    
    // Now fetch the join request with populated data to verify
    const populatedRequest = await JoinRequest.findById(savedRequest._id)
      .populate({
        path: 'groupId',
        select: 'name description ownerId members isPrivate',
        populate: {
          path: 'ownerId',
          select: 'firstName lastName email avatar'
        }
      })
      .lean();
    
    console.log('Populated test join request:', populatedRequest);
    
    res.json({ 
      message: 'Test join request created', 
      joinRequest: savedRequest,
      populatedRequest: populatedRequest
    });
  } catch (error) {
    console.error('Test create join request error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Debug route to check all join requests in database
router.get('/debug/all', requireAuth, async (req, res) => {
  try {
    const allJoinRequests = await JoinRequest.find({})
      .populate('userId', 'firstName lastName email')
      .populate('groupId', 'name description')
      .lean();
    
    console.log('All join requests in database:', allJoinRequests);
    res.json({ 
      count: allJoinRequests.length, 
      joinRequests: allJoinRequests 
    });
  } catch (error) {
    console.error('Debug get all join requests error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Debug route to check a specific join request
router.get('/debug/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const joinRequest = await JoinRequest.findById(id)
      .populate({
        path: 'groupId',
        select: 'name description ownerId',
        populate: {
          path: 'ownerId',
          select: 'firstName lastName email'
        }
      })
      .populate('userId', 'firstName lastName email avatar')
      .lean();
    
    console.log('Debug join request:', joinRequest);
    res.json({ joinRequest });
  } catch (error) {
    console.error('Debug join request error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Comprehensive debug route to test join request flow
router.get('/debug/flow/:userId', requireAuth, async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('=== COMPREHENSIVE DEBUG FLOW ===');
    console.log('Testing for user:', userId);
    
    // 1. Check if user exists
    const user = await User.findById(userId);
    console.log('1. User found:', user ? 'Yes' : 'No');
    if (user) {
      console.log('   User details:', { firstName: user.firstName, lastName: user.lastName, email: user.email });
    }
    
    // 2. Get all groups
    const allGroups = await Group.find({});
    console.log('2. Total groups in database:', allGroups.length);
    allGroups.forEach((group, index) => {
      console.log(`   Group ${index}:`, { id: group._id, name: group.name, ownerId: group.ownerId });
    });
    
    // 3. Get all join requests
    const allJoinRequests = await JoinRequest.find({});
    console.log('3. Total join requests in database:', allJoinRequests.length);
    allJoinRequests.forEach((request, index) => {
      console.log(`   Join Request ${index}:`, { 
        id: request._id, 
        userId: request.userId, 
        groupId: request.groupId, 
        status: request.status 
      });
    });
    
    // 4. Get join requests for this specific user
    const userJoinRequests = await JoinRequest.find({ userId: userId });
    console.log('4. Join requests for this user:', userJoinRequests.length);
    userJoinRequests.forEach((request, index) => {
      console.log(`   User Join Request ${index}:`, { 
        id: request._id, 
        groupId: request.groupId, 
        status: request.status 
      });
    });
    
    // 5. Test population
    if (userJoinRequests.length > 0) {
      const testRequest = userJoinRequests[0];
      console.log('5. Testing population for request:', testRequest._id);
      
      const populatedRequest = await JoinRequest.findById(testRequest._id)
        .populate({
          path: 'groupId',
          select: 'name description ownerId members isPrivate',
          populate: {
            path: 'ownerId',
            select: 'firstName lastName email avatar'
          }
        })
        .lean();
      
      console.log('   Populated request:', populatedRequest);
      console.log('   Group data:', populatedRequest?.group);
      console.log('   Group name:', populatedRequest?.group?.name);
      console.log('   Group owner:', populatedRequest?.group?.ownerId);
    }
    
    // 6. Test the actual API endpoint
    const apiResponse = await JoinRequest.find({
      userId: userId,
      status: 'pending'
    }).populate({
      path: 'groupId',
      select: 'name description ownerId members isPrivate',
      populate: {
        path: 'ownerId',
        select: 'firstName lastName email avatar'
      }
    }).lean();
    
    console.log('6. API endpoint response:', apiResponse);
    console.log('=== END DEBUG FLOW ===');
    
    res.json({
      user: user,
      totalGroups: allGroups.length,
      totalJoinRequests: allJoinRequests.length,
      userJoinRequests: userJoinRequests.length,
      apiResponse: apiResponse,
      debug: 'Check server console for detailed logs'
    });
  } catch (error) {
    console.error('Debug flow error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router; 