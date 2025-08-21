import express from 'express';
import { z } from 'zod';
import { requireAuth, AuthenticatedRequest } from '../Middleware/auth';
import { Group } from '../models/User';
import { insertGroupSchema } from '@shared/schema';

const router = express.Router();

// Create a new group
router.post('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('Group creation request body:', req.body);
    console.log('Authenticated user:', req.user);
    
    // Create a schema that omits ownerId since we'll set it from the authenticated user
    const createGroupSchema = insertGroupSchema.omit({ ownerId: true });
    const body = createGroupSchema.parse(req.body);
    
    console.log('=== BACKEND GROUP CREATION DEBUG ===');
    console.log('Parsed body:', body);
    console.log('Members from body:', body.members);
    console.log('Members type:', typeof body.members);
    console.log('Members length:', body.members?.length);
    console.log('=== END BACKEND DEBUG ===');
    
    const groupData = {
      ...body,
      ownerId: req.user?.id,
      members: [req.user?.id] // Start with owner as a member
    };
    
    console.log('Group data to save:', groupData);
    
    const group = new Group(groupData);
    await group.save();
    
    // Create join requests for selected members AND the owner
    const { JoinRequest } = await import('../models/User');
    
    // Create a join request for the owner (auto-accepted)
    console.log('Creating join request for owner:', req.user?.id);
    const ownerJoinRequest = new JoinRequest({
      userId: req.user?.id,
      groupId: group._id,
      status: 'accepted' // Auto-accept for owner
    });
    await ownerJoinRequest.save();
    console.log('Created owner join request:', ownerJoinRequest);
    
    // Create join requests for selected members
    if (body.members && body.members.length > 0) {
      console.log('Creating join requests for members:', body.members);
      console.log('Group owner ID:', req.user?.id);
      console.log('Group ID:', group._id);
      
      for (const memberId of body.members) {
        // Skip if the member is the same as the owner (already handled above)
        if (memberId === req.user?.id) {
          console.log('Skipping duplicate join request for owner:', memberId);
          continue;
        }
        
        console.log('Creating join request for member:', memberId);
        
        const joinRequest = new JoinRequest({
          userId: memberId,
          groupId: group._id,
          status: 'pending'
        });
        
        const savedRequest = await joinRequest.save();
        console.log('Created join request:', savedRequest);
      }
    } else {
      console.log('No additional members provided for join requests');
      console.log('Body members:', body.members);
      console.log('Body keys:', Object.keys(body));
    }
    
    console.log('Group created successfully:', group);
    res.json(group);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      return res.status(400).json({ message: "Invalid group data", errors: error.errors });
    }
    console.error('Group creation error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get groups for a specific user
router.get('/user/:userId', requireAuth, async (req, res) => {
  try {
    const userId = req.params.userId;
    const groups = await Group.find({ 
      $or: [
        { ownerId: userId },
        { members: userId }
      ]
    });
    res.json(groups);
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get a specific group by ID
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const group = await Group.findById(id);
    
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    
    res.json(group);
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update a group
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;
    
    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    
    await Group.findByIdAndUpdate(id, updates);
    res.json({ message: "Group updated successfully" });
  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete a group
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    
    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    
    await Group.findByIdAndDelete(id);
    res.json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get group members
router.get('/:id/members', requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const group = await Group.findById(id).populate('members', 'firstName lastName email avatar').lean();
    
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    
    res.json(group.members || []);
  } catch (error) {
    console.error('Get group members error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router; 