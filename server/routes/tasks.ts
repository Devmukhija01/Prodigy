import express from 'express';
import { z } from 'zod';
import { requireAuth, AuthenticatedRequest } from '../Middleware/auth';
import { Task, Group } from '../models/User';
import { insertTaskSchema } from '@shared/schema';

const router = express.Router();

// Create a new task
router.post('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    console.log('Task creation request body:', req.body);
    
    const body = insertTaskSchema.parse(req.body);
    console.log('Parsed task data:', body);
    
    // Security check: Users can only create tasks for themselves
    if (body.userId !== req.user?.id) {
      return res.status(403).json({ message: "Access denied. You can only create tasks for yourself." });
    }
    
    const task = new Task(body);
    await task.save();
    res.json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      return res.status(400).json({ message: "Invalid task data", errors: error.errors });
    }
    console.error('Task creation error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get tasks for a specific user
router.get('/user/:userId', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.params.userId;
    
    // Security check: Only allow users to access their own tasks
    if (req.user?.id !== userId) {
      return res.status(403).json({ message: "Access denied. You can only view your own tasks." });
    }
    
    const tasks = await Task.find({ userId }).populate('groupId', 'name');
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get tasks with groups for a specific user
router.get('/user/:userId/with-groups', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.params.userId;
    
    // Security check: Only allow users to access their own tasks
    if (req.user?.id !== userId) {
      return res.status(403).json({ message: "Access denied. You can only view your own tasks." });
    }
    
    const tasks = await Task.find({ userId }).populate('groupId', 'name description').lean();
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks with groups error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get a specific task by ID
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const task = await Task.findById(id).populate('groupId', 'name');
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update a task
router.patch('/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;
    
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    // Security check: Only allow users to update their own tasks
    if (req.user?.id !== task.userId.toString()) {
      return res.status(403).json({ message: "Access denied. You can only update your own tasks." });
    }
    
    await Task.findByIdAndUpdate(id, { ...updates, updatedAt: new Date() });
    res.json({ message: "Task updated successfully" });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Complete a task
router.patch('/:id/complete', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const id = req.params.id;
    
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    // Security check: Only allow users to complete their own tasks
    if (req.user?.id !== task.userId.toString()) {
      return res.status(403).json({ message: "Access denied. You can only complete your own tasks." });
    }
    
    await Task.findByIdAndUpdate(id, { status: 'completed', updatedAt: new Date() });
    res.json({ message: "Task marked as complete" });
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete a task
router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const id = req.params.id;
    
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    // Security check: Only allow users to delete their own tasks
    if (req.user?.id !== task.userId.toString()) {
      return res.status(403).json({ message: "Access denied. You can only delete your own tasks." });
    }
    
    await Task.findByIdAndDelete(id);
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get tasks for a specific group
router.get('/group/:groupId', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const groupId = req.params.groupId;
    
    // Check if user is a member of the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    
    // Security check: Only allow group members to view group tasks
    if (group.ownerId.toString() !== req.user?.id && !group.members.includes(req.user?.id)) {
      return res.status(403).json({ message: "Access denied. You must be a member of this group to view tasks." });
    }
    
    const tasks = await Task.find({ groupId }).populate('userId', 'firstName lastName email avatar').lean();
    res.json(tasks);
  } catch (error) {
    console.error('Get group tasks error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get personal tasks for a specific user (no group)
router.get('/user/:userId/personal', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.params.userId;
    
    // Security check: Only allow users to access their own tasks
    if (req.user?.id !== userId) {
      return res.status(403).json({ message: "Access denied. You can only view your own tasks." });
    }
    
    const tasks = await Task.find({ 
      userId,
      groupId: { $exists: false }
    }).populate('userId', 'firstName lastName email avatar').lean();
    res.json(tasks);
  } catch (error) {
    console.error('Get personal tasks error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get team tasks for a specific user (assigned from groups)
router.get('/user/:userId/team', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.params.userId;
    
    // Security check: Only allow users to access their own tasks
    if (req.user?.id !== userId) {
      return res.status(403).json({ message: "Access denied. You can only view your own tasks." });
    }
    
    const tasks = await Task.find({ 
      userId,
      groupId: { $exists: true }
    }).populate('userId', 'firstName lastName email avatar').populate('groupId', 'name').lean();
    res.json(tasks);
  } catch (error) {
    console.error('Get team tasks error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get team tasks for a specific user from a specific group
router.get('/user/:userId/team/:groupId', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.params.userId;
    const groupId = req.params.groupId;
    
    // Security check: Only allow users to access their own tasks
    if (req.user?.id !== userId) {
      return res.status(403).json({ message: "Access denied. You can only view your own tasks." });
    }
    
    const tasks = await Task.find({ 
      userId,
      groupId: groupId
    }).populate('userId', 'firstName lastName email avatar').populate('groupId', 'name').lean();
    res.json(tasks);
  } catch (error) {
    console.error('Get team tasks error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router; 