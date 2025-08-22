import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Plus, Users, CheckCircle, Clock, Search, Bell, UserPlus, Edit, Trash2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertGroupSchema, insertTaskSchema, insertJoinRequestSchema, type InsertGroup, type InsertTask, type Group, type Task, type JoinRequest, type User } from '@shared/schema';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

function isOwnerObject(owner: any): owner is { _id: string; firstName: string; lastName: string; email: string; avatar?: string } {
  return owner && typeof owner === 'object' && '_id' in owner && 'firstName' in owner && 'lastName' in owner && 'email' in owner;
}

function isOwnerString(owner: any): owner is string {
  return typeof owner === 'string';
}

export default function Brand() {
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isJoinRequestsOpen, setIsJoinRequestsOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewFilter, setViewFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedGroupForTasks, setSelectedGroupForTasks] = useState<Group | null>(null);
  

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user from localStorage
  const getCurrentUser = () => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        return parsed;
      } catch (error) {
        console.error("Error parsing userData:", error);
        return null;
      }
    }
    return null;
  };

  const currentUser = getCurrentUser();

  const { data: groups = [], isLoading: groupsLoading } = useQuery<Group[]>({
    queryKey: ['/api/groups/user', currentUser?._id],
    queryFn: async () => {
      if (!currentUser?._id) return [];
      const response = await axios.get(`http://https://prodigy-59mg.onrender.com/api/groups/user/${currentUser._id}`, { withCredentials: true });
      return response.data;
    },
    enabled: !!currentUser?._id,
  });

  // Get join requests for groups owned by current user
  const { data: ownerJoinRequests = [], isLoading: ownerRequestsLoading } = useQuery<(JoinRequest & { user: User; group: Group })[]>({
    queryKey: ['/api/join-requests/owner', currentUser?._id],
    queryFn: async () => {
      if (!currentUser?._id) return [];
      const response = await axios.get(`http://https://prodigy-59mg.onrender.com/api/join-requests/owner/${currentUser._id}`, { withCredentials: true });
      return response.data;
    },
    enabled: !!currentUser?._id,
  });

  // Get join requests for current user
  const { data: userJoinRequests = [], isLoading: userRequestsLoading } = useQuery<any[]>({
    queryKey: ['/api/join-requests/user', currentUser?._id],
    queryFn: async () => {
      if (!currentUser?._id) return [];
      console.log('=== FETCHING JOIN REQUESTS ===');
      console.log('Current user ID:', currentUser._id);
      
      try {
        const response = await axios.get(`http://https://prodigy-59mg.onrender.com/api/join-requests/user/${currentUser._id}`, { withCredentials: true });
        console.log('Raw response data:', response.data);
        
        // Debug: Log each request
        response.data.forEach((request: any, index: number) => {
          console.log(`Request ${index}:`, {
            id: request._id,
            userId: request.userId,
            groupId: request.groupId,
            status: request.status,
            group: request.group,
            groupName: request.group?.name,
            groupOwner: request.group?.ownerId,
            requestedAt: request.requestedAt
          });
        });
        
        console.log('=== END FETCHING ===');
        return response.data;
      } catch (error) {
        console.error('Error fetching join requests:', error);
        return [];
      }
    },
    enabled: !!currentUser?._id,
    refetchInterval: 5000, // Refetch every 5 seconds for testing
  });

  // Poll for new join requests every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentUser?._id) {
        queryClient.invalidateQueries({ queryKey: ['/api/join-requests/user', currentUser?._id] });
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [currentUser?._id, queryClient]);

  const { data: userTasks = [] } = useQuery<(Task & { group: Group })[]>({
    queryKey: ['/api/tasks/user/with-groups', currentUser?._id],
    queryFn: async () => {
      if (!currentUser?._id) return [];
      const response = await axios.get(`http://https://prodigy-59mg.onrender.com/api/tasks/user/${currentUser._id}/with-groups`, { withCredentials: true });
      return response.data;
    },
    enabled: !!currentUser?._id,
  });

  // Get current user's friends for member selection
  const { data: friends = [] } = useQuery<User[]>({
    queryKey: ['/api/user/friends', currentUser?._id],
    queryFn: async () => {
      if (!currentUser?._id) return [];
      const response = await axios.get(`http://https://prodigy-59mg.onrender.com/api/user/friends`, { withCredentials: true });
      return response.data;
    },
    enabled: !!currentUser?._id,
  });

  // Get tasks for selected group
  const { data: groupTasks = [] } = useQuery<(Task & { user: User })[]>({
    queryKey: ['/api/tasks/group', selectedGroupForTasks?._id],
    queryFn: async () => {
      if (!selectedGroupForTasks?._id) return [];
      const response = await axios.get(`http://https://prodigy-59mg.onrender.com/api/tasks/group/${selectedGroupForTasks._id}`, { withCredentials: true });
      return response.data;
    },
    enabled: !!selectedGroupForTasks?._id,
  });

  // Group creation
  const createGroupForm = useForm<InsertGroup & { members: string[] }>({
    resolver: zodResolver(insertGroupSchema.omit({ ownerId: true })),
    defaultValues: {
      name: '',
      description: '',
      isPrivate: false,
      members: [],
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: async (data: Omit<InsertGroup, 'ownerId'> & { members: string[] }) => {
      console.log('=== MUTATION DEBUG ===');
      console.log('Creating group with data:', data);
      console.log('Members array:', data.members);
      console.log('Members array type:', Array.isArray(data.members));
      console.log('=== END MUTATION DEBUG ===');
      const response = await apiRequest('POST', '/api/groups', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/groups/user', currentUser?._id] });
      setIsCreateGroupOpen(false);
      createGroupForm.reset();
      toast({
        title: "Success",
        description: "Group created successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create group. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Task creation
  type CreateTaskFormData = {
    title: string;
    description: string;
    status: string;
    priority: string;
    groupId?: string;
    assigneeId?: string;
    dueDate?: string;
  };

  const createTaskForm = useForm<CreateTaskFormData>({
    resolver: zodResolver(insertTaskSchema.omit({ userId: true })),
    defaultValues: {
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      dueDate: '',
      assigneeId: '',
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: CreateTaskFormData) => {
      const taskData = {
        ...data,
        userId: data.assigneeId || currentUser?._id, // Use assignee if provided, otherwise current user
      };
      
      // Remove assigneeId from the data sent to server since we're using userId
      const { assigneeId, ...serverData } = taskData;
      
      console.log('Creating task with data:', serverData);
      const response = await axios.post('http://https://prodigy-59mg.onrender.com/api/tasks', serverData, { withCredentials: true });
      console.log('Task created successfully:', response.data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/user/with-groups', currentUser?._id] });
      setIsCreateTaskOpen(false);
      createTaskForm.reset();
      toast({
        title: "Success",
        description: "Task created successfully!",
      });
    },
    onError: (error) => {
      console.error('Task creation error:', error);
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Join request management (for group owners)
  const updateJoinRequestMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest('PATCH', `/api/join-requests/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/join-requests/owner', currentUser?._id] });
      queryClient.invalidateQueries({ queryKey: ['/api/join-requests/user', currentUser?._id] });
      queryClient.invalidateQueries({ queryKey: ['/api/groups/user', currentUser?._id] });
      toast({
        title: "Success",
        description: "Join request updated successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update join request.",
        variant: "destructive",
      });
    },
  });

  // User join request management (for users receiving requests)
  const handleUserJoinRequestMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      console.log('Handling join request:', id, 'with status:', status);
      const response = await apiRequest('PATCH', `/api/join-requests/${id}`, { status });
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/join-requests/user', currentUser?._id] });
      queryClient.invalidateQueries({ queryKey: ['/api/groups/user', currentUser?._id] });
      
      if (variables.status === 'accepted') {
        toast({
          title: "Success! 🎉",
          description: "You have successfully joined the group!",
        });
      } else {
        toast({
          title: "Request Rejected",
          description: "You have rejected the group invitation.",
        });
      }
    },
    onError: (error) => {
      console.error('Join request handling error:', error);
      toast({
        title: "Error",
        description: "Failed to handle join request.",
        variant: "destructive",
      });
    },
  });

  const markTaskCompleteMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await apiRequest('PATCH', `/api/tasks/${taskId}/complete`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/user', currentUser?._id] });
      toast({
        title: "Success",
        description: "Task marked as complete!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to complete task.",
        variant: "destructive",
      });
    },
  });

  const onCreateGroup = (data: Omit<InsertGroup, 'ownerId'> & { members: string[] }) => {
    console.log('=== GROUP CREATION DEBUG ===');
    console.log('Creating group with data:', data);
    console.log('Selected members:', data.members);
    console.log('Members type:', typeof data.members);
    console.log('Members length:', data.members?.length);
    console.log('Current user ID:', currentUser?._id);
    console.log('Available friends:', friends);
    console.log('=== END DEBUG ===');
    createGroupMutation.mutate(data);
  };

  const onCreateTask = (data: CreateTaskFormData) => {
    createTaskMutation.mutate(data);
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'No due date';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'in_progress':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'overdue':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'medium':
        return 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200';
      case 'low':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const activeTasks = userTasks.filter(task => task.status !== 'completed');
  const completedTasks = userTasks.filter(task => task.status === 'completed');
  const overdueTasks = userTasks.filter(task => {
    if (!task.dueDate || task.status === 'completed') return false;
    return new Date(task.dueDate) < new Date();
  });

  // Simple filtering - show all join requests for the current user
  const filteredUserJoinRequests = userJoinRequests || [];

  // Debug logging
  console.log('=== JOIN REQUESTS DEBUG ===');
  console.log('Current user ID:', currentUser?._id);
  console.log('All user join requests:', userJoinRequests);
  console.log('Filtered user join requests:', filteredUserJoinRequests);
  console.log('Owner join requests:', ownerJoinRequests);
  
  // Check if the current user matches the join request user
  if (userJoinRequests.length > 0) {
    userJoinRequests.forEach((request, index) => {
      console.log(`Request ${index}:`, {
        requestUserId: request.userId,
        currentUserId: currentUser?._id,
        isMatch: request.userId === currentUser?._id,
        groupOwnerId: request.group?.ownerId,
        groupOwnerType: typeof request.group?.ownerId
      });
    });
  }
  console.log('=== END DEBUG ===');

  // Show notification when new join requests are received
  useEffect(() => {
    if (filteredUserJoinRequests.length > 0) {
      toast({
        title: "New Group Invitation",
        description: `You have ${filteredUserJoinRequests.length} pending group invitation(s). Check the Requests button to view them.`,
      });
    }
  }, [filteredUserJoinRequests.length, toast]);

  // Check if user is logged in
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Groups & Tasks</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">Please log in to view and manage your groups and tasks.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Groups & Tasks</h2>
            <p className="text-gray-600 dark:text-gray-400">Collaborate with your team on projects and tasks</p>
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="outline"
              onClick={() => {
                // Refresh join requests
                queryClient.invalidateQueries({ queryKey: ['/api/join-requests/user', currentUser?._id] });
                queryClient.invalidateQueries({ queryKey: ['/api/join-requests/owner', currentUser?._id] });
                setIsJoinRequestsOpen(true);
              }}
              className="relative"
            >
              <Bell className="w-4 h-4 mr-2" />
              {(ownerJoinRequests.length + filteredUserJoinRequests.length) > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {ownerJoinRequests.length + filteredUserJoinRequests.length}
                </span>
              )}
              Requests
            </Button>
            <Button 
              onClick={() => setIsCreateGroupOpen(true)}
              className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
            {/* <Button 
              variant="outline"
              onClick={async () => {
                // Test: Create a join request manually
                try {
                  if (groups.length > 0 && friends.length > 0) {
                    const testGroup = groups[0];
                    const testUser = friends[0];
                    console.log('Creating test join request for:', testUser.firstName, 'to join:', testGroup.name);
                    
                    const response = await axios.post('http://https://prodigy-59mg.onrender.com/api/join-requests/test-create', {
                      userId: testUser._id,
                      groupId: testGroup._id
                    }, { withCredentials: true });
                    
                    console.log('Test join request created:', response.data);
                    toast({
                      title: "Test Join Request Created",
                      description: `Created join request for ${testUser.firstName} to join ${testGroup.name}`,
                    });
                    
                    // Refresh the queries
                    queryClient.invalidateQueries({ queryKey: ['/api/join-requests/user', currentUser?._id] });
                    queryClient.invalidateQueries({ queryKey: ['/api/join-requests/owner', currentUser?._id] });
                  } else {
                    toast({
                      title: "No Test Data",
                      description: "Need at least one group and one friend to test",
                      variant: "destructive"
                    });
                  }
                } catch (error) {
                  console.error('Test join request error:', error);
                  toast({
                    title: "Test Failed",
                    description: "Failed to create test join request",
                    variant: "destructive"
                  });
                }
              }}
            >
              Test Join Request
            </Button>
            <Button 
              variant="outline"
              onClick={async () => {
                // Debug: Check all join requests
                try {
                  const response = await axios.get('http://https://prodigy-59mg.onrender.com/api/join-requests/debug/all', { withCredentials: true });
                  console.log('All join requests:', response.data);
                  toast({
                    title: "Debug Info",
                    description: `Found ${response.data.count} join requests in database`,
                  });
                } catch (error) {
                  console.error('Debug error:', error);
                  toast({
                    title: "Debug Error",
                    description: "Failed to get debug info",
                    variant: "destructive"
                  });
                }
              }}
            >
              Debug All
            </Button>
            <Button 
              variant="outline"
              onClick={async () => {
                // Debug: Test creating a join request
                try {
                  if (groups.length > 0 && friends.length > 0) {
                    const testGroup = groups[0];
                    const testUser = friends[0];
                    const response = await axios.post('http://https://prodigy-59mg.onrender.com/api/join-requests/test-create', {
                      userId: testUser._id,
                      groupId: testGroup._id
                    }, { withCredentials: true });
                    console.log('Test join request created:', response.data);
                    toast({
                      title: "Test Join Request",
                      description: `Created test join request for ${testUser.firstName} to join ${testGroup.name}`,
                    });
                    // Refresh the queries
                    queryClient.invalidateQueries({ queryKey: ['/api/join-requests/user', currentUser?._id] });
                    queryClient.invalidateQueries({ queryKey: ['/api/join-requests/owner', currentUser?._id] });
                  } else {
                    toast({
                      title: "Debug Error",
                      description: "No groups or friends available for testing",
                      variant: "destructive"
                    });
                  }
                } catch (error) {
                  console.error('Test join request error:', error);
                  toast({
                    title: "Debug Error",
                    description: "Failed to create test join request",
                    variant: "destructive"
                  });
                }
              }}
            >
              Test Join Request
            </Button>
            <Button 
              variant="outline"
              onClick={async () => {
                // Debug: Comprehensive flow test
                try {
                  const response = await axios.get(`http://https://prodigy-59mg.onrender.com/api/join-requests/debug/flow/${currentUser?._id}`, { withCredentials: true });
                  console.log('Debug flow response:', response.data);
                  toast({
                    title: "Debug Flow",
                    description: `Found ${response.data.userJoinRequests} join requests for user. Check console for details.`,
                  });
                } catch (error) {
                  console.error('Debug flow error:', error);
                  toast({
                    title: "Debug Error",
                    description: "Failed to run debug flow",
                    variant: "destructive"
                  });
                }
              }}
            >
              Debug Flow
            </Button>
            <Button 
              variant="outline"
              onClick={async () => {
                console.log('=== MANUAL DEBUG ===');
                console.log('Current user:', currentUser);
                console.log('User join requests:', userJoinRequests);
                console.log('Filtered requests:', filteredUserJoinRequests);
                console.log('Owner requests:', ownerJoinRequests);
                
                // Test API call directly
                try {
                  const response = await axios.get(`http://https://prodigy-59mg.onrender.com/api/join-requests/user/${currentUser?._id}`, { withCredentials: true });
                  console.log('Direct API response:', response.data);
                  toast({
                    title: "API Test",
                    description: `API returned ${response.data.length} requests`,
                  });
                } catch (error) {
                  console.error('API test error:', error);
                  toast({
                    title: "API Error",
                    description: "Failed to fetch join requests",
                    variant: "destructive"
                  });
                }
              }}
            >
              Test API
            </Button> */}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="glass-effect shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">My Groups</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{groups.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Tasks</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeTasks.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <CheckCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedTasks.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-full">
                  <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{overdueTasks.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search groups and tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={viewFilter} onValueChange={setViewFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="groups">Groups Only</SelectItem>
              <SelectItem value="tasks">Tasks Only</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Groups Section */}
        {(viewFilter === 'all' || viewFilter === 'groups') && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Groups</h2>
            
            {groupsLoading ? (
              <div className="grid grid-cols-1 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="glass-effect shadow-xl animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-6"></div>
                      <div className="flex space-x-2">
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : groups.length === 0 ? (
              <Card className="glass-effect shadow-xl">
                <CardContent className="p-12 text-center">
                  <Users className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No groups yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {filteredUserJoinRequests.length > 0 
                      ? "You have pending group invitations. Check the Requests button to accept them!"
                      : "Create your first group to start collaborating with your team!"
                    }
                  </p>
                  <div className="flex justify-center space-x-3">
                    {userJoinRequests.length > 0 && (
                      <Button 
                        onClick={() => setIsJoinRequestsOpen(true)}
                        variant="outline"
                      >
                        <Bell className="w-4 h-4 mr-2" />
                        View Requests
                      </Button>
                    )}
                    <Button 
                      onClick={() => setIsCreateGroupOpen(true)}
                      className="bg-gradient-to-r from-primary to-secondary"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Group
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {groups.map((group) => (
                  <Card key={group._id} className="glass-effect shadow-xl hover:shadow-2xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 bg-gradient-to-r from-primary to-secondary rounded-full">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                              {group.name}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                              {group.description || 'No description'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                            Owner
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedGroupId(group._id);
                              setIsCreateTaskOpen(true);
                            }}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Task
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedGroupForTasks(group);
                            }}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            View Tasks
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tasks Section */}
        {(viewFilter === 'all' || viewFilter === 'tasks') && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Tasks</h2>
            
            {userTasks.length === 0 ? (
              <Card className="glass-effect shadow-xl">
                <CardContent className="p-12 text-center">
                  <CheckCircle className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No tasks assigned
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Tasks assigned to you will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userTasks.map((task) => (
                  <Card key={task._id} className="glass-effect shadow-xl hover:shadow-2xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {task.title}
                        </h4>
                        <div className="flex space-x-1">
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {task.description}
                        </p>
                      )}
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Group:</span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {task.group?.name || 'No Group'}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Due:</span>
                          <span className="text-gray-900 dark:text-white">
                            {formatDate(task.dueDate)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Status:</span>
                          <Badge className={getTaskStatusColor(task.status)}>
                            {task.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      
                      {task.status !== 'completed' && (
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => markTaskCompleteMutation.mutate(task._id)}
                            disabled={markTaskCompleteMutation.isPending}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Complete
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick Actions Panel */}
        <Card className="glass-effect shadow-xl">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={() => setIsCreateGroupOpen(true)}
                variant="outline" 
                className="flex items-center space-x-3 p-4 h-auto"
              >
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Create Group</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Start a new project team</p>
                </div>
              </Button>
              
              <Button 
                onClick={() => setIsJoinRequestsOpen(true)}
                variant="outline" 
                className="flex items-center space-x-3 p-4 h-auto"
              >
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                  <UserPlus className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Join Requests</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manage pending requests</p>
                </div>
              </Button>
              
              <Button 
                onClick={() => window.location.href = "/brand"}
                variant="outline" 
                className="flex items-center space-x-3 p-4 h-auto"
              >
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Brand Assets</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manage your brand</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Group Modal */}
      <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
          </DialogHeader>
          <Form {...createGroupForm}>
            <form onSubmit={createGroupForm.handleSubmit(onCreateGroup)} className="space-y-4">
              <FormField
                control={createGroupForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter group name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createGroupForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your group's purpose" 
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createGroupForm.control}
                name="isPrivate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Privacy</FormLabel>
                    <Select onValueChange={(value) => field.onChange(value === 'true')} defaultValue={field.value ? 'true' : 'false'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="false">Public - Anyone can request to join</SelectItem>
                        <SelectItem value="true">Private - Invite only</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createGroupForm.control}
                name="members"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Members</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Select 
                          onValueChange={(value) => {
                            if (value && !field.value.includes(value)) {
                              field.onChange([...field.value, value]);
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select team members" />
                          </SelectTrigger>
                          <SelectContent>
                            {friends.length === 0 ? (
                              <SelectItem value="" disabled>
                                No friends available. Add friends first to create groups.
                              </SelectItem>
                            ) : (
                              friends
                                .filter(user => user._id !== currentUser?._id) // Exclude current user
                                .map((user) => (
                                  <SelectItem key={user._id} value={user._id}>
                                    {user.firstName} {user.lastName} ({user.email})
                                  </SelectItem>
                                ))
                            )}
                          </SelectContent>
                        </Select>
                        
                        {field.value.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">Selected Members:</p>
                            <div className="flex flex-wrap gap-2">
                              {field.value.map((memberId) => {
                                const user = friends.find(u => u._id === memberId);
                                return user ? (
                                  <Badge key={memberId} variant="secondary" className="flex items-center gap-1">
                                    {user.firstName} {user.lastName}
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="h-4 w-4 p-0 hover:bg-transparent"
                                      onClick={() => field.onChange(field.value.filter(id => id !== memberId))}
                                    >
                                      ×
                                    </Button>
                                  </Badge>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateGroupOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createGroupMutation.isPending}>
                  {createGroupMutation.isPending ? 'Creating...' : 'Create Group'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Create Task Modal */}
      <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <Form {...createTaskForm}>
            <form onSubmit={createTaskForm.handleSubmit(onCreateTask)} className="space-y-4">
              <FormField
                control={createTaskForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter task title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createTaskForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the task details" 
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
                            <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createTaskForm.control}
                  name="groupId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Group</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select group" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {groups.map((group) => (
                            <SelectItem key={group._id} value={group._id}>
                              {group.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createTaskForm.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={createTaskForm.control}
                name="assigneeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign To</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select assignee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {friends.length === 0 ? (
                          <SelectItem value="" disabled>
                            No friends available. Add friends first to assign tasks.
                          </SelectItem>
                        ) : (
                          friends
                            .filter(user => user._id !== currentUser?._id) // Exclude current user
                            .map((user) => (
                              <SelectItem key={user._id} value={user._id}>
                                {user.firstName} {user.lastName} ({user.email})
                              </SelectItem>
                            ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createTaskForm.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateTaskOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createTaskMutation.isPending}>
                  {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Join Requests Modal */}
      <Dialog open={isJoinRequestsOpen} onOpenChange={setIsJoinRequestsOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Join Requests</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {ownerRequestsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center space-x-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (ownerJoinRequests.length === 0 && filteredUserJoinRequests.length === 0) ? (
              <div className="text-center py-8">
                <Bell className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No pending join requests</p>
              </div>
            ) : (
              <>
                {/* Owner Join Requests - REMOVED */}
                {/* {ownerJoinRequests.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Group Owner Requests</h3>
                    {ownerJoinRequests.map((request) => (
                      <div key={request._id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {request.user?.avatar && (
                              <img 
                                src={request.user.avatar} 
                                alt="User profile" 
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            )}
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {request.user?.firstName && request.user?.lastName 
                                  ? `${request.user.firstName} ${request.user.lastName}` 
                                  : request.user?.email || 'Unknown User'}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                wants to join <span className="font-medium">{request.group?.name || 'Unknown Group'}</span>
                              </p>
                              {request.group?.description && typeof request.group.description === 'string' && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {request.group.description}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDate(request.requestedAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              size="sm"
                              onClick={() => updateJoinRequestMutation.mutate({ id: request._id, status: 'accepted' })}
                              disabled={updateJoinRequestMutation.isPending}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Accept
                            </Button>
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => updateJoinRequestMutation.mutate({ id: request._id, status: 'rejected' })}
                              disabled={updateJoinRequestMutation.isPending}
                              className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900"
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )} */}

                {/* User Join Requests */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Join Requests</h3>
                  
                  {/* Debug: Show raw data */}
                  {/* <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Debug Info:</h4>
                    <p>Total requests: {userJoinRequests.length}</p>
                    <p>Filtered requests: {filteredUserJoinRequests.length}</p>
                    <p>Current user ID: {currentUser?._id}</p>
                    <p>Loading: {userRequestsLoading ? 'Yes' : 'No'}</p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        console.log('Raw userJoinRequests:', userJoinRequests);
                        console.log('Raw filteredUserJoinRequests:', filteredUserJoinRequests);
                        toast({
                          title: "Debug Data",
                          description: `Raw: ${userJoinRequests.length}, Filtered: ${filteredUserJoinRequests.length}`,
                        });
                      }}
                    >
                      Log Raw Data
                    </Button>
                  </div> */}
                  
                  {/* Show raw data for debugging */}
                  {/* {userJoinRequests.length > 0 && (
                    <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Raw Join Request Data:</h4>
                      {userJoinRequests.map((request, index) => (
                        <div key={index} className="mb-2 p-2 bg-white dark:bg-gray-800 rounded">
                          <p><strong>Request {index + 1}:</strong></p>
                          <p>ID: {request._id}</p>
                          <p>User ID: {typeof request.userId === 'string' ? request.userId : 'Invalid ID'}</p>
                          <p>Group ID: {typeof request.groupId === 'string' ? request.groupId : 'Invalid ID'}</p>
                          <p>Status: {typeof request.status === 'string' ? request.status : 'Unknown'}</p>
                          <p>Group Name: {typeof request.group?.name === 'string' ? request.group.name : 'No name'}</p>
                          <p>Group Description: {typeof request.group?.description === 'string' ? request.group.description : 'No description'}</p>
                          <p>Group Owner: {request.group?.ownerId ? 
                            (typeof request.group.ownerId === 'object' && request.group.ownerId !== null ? 
                              `${(request.group.ownerId as any).firstName} ${(request.group.ownerId as any).lastName}` : 
                              String(request.group.ownerId)) : 'No owner'}</p>
                          <p>Requested At: {request.requestedAt ? new Date(request.requestedAt).toLocaleString() : 'No date'}</p>
                        </div>
                      ))}
                    </div>
                  )} */}
                  
                  {/* Simple debug info */}
                  <div className="bg-red-100 dark:bg-red-900 p-2 rounded mb-4">
                    <p className="text-sm">Debug: {userJoinRequests.length} total requests, {filteredUserJoinRequests.length} filtered</p>
                    <p className="text-sm">Current User: {currentUser?._id}</p>
                    <p className="text-sm">Loading: {userRequestsLoading ? 'Yes' : 'No'}</p>
                    <p className="text-sm">Expected User ID: 687ddf0201f64e8c786d60a0</p>
                    <p className="text-sm">Match: {currentUser?._id === '687ddf0201f64e8c786d60a0' ? 'YES' : 'NO'}</p>
                  </div>
                  
                  {/* Show ALL join requests for debugging */}
                  {userJoinRequests.length > 0 && (
                    <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg mb-4">
                      <h4 className="font-semibold mb-2">ALL Join Requests (Unfiltered):</h4>
                      {userJoinRequests.map((request, index) => (
                        <div key={index} className="mb-2 p-2 bg-white dark:bg-gray-800 rounded">
                          <p><strong>Request {index + 1}:</strong></p>
                          <p>User ID: {request.userId}</p>
                          <p>Group Name: {request.group?.name}</p>
                          <p>Status: {request.status}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {filteredUserJoinRequests.length > 0 ? (
                    filteredUserJoinRequests.map((request) => (
                      <div key={request._id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                You were invited to join <span className="font-medium">{request.group?.name || 'Unknown Group'}</span>
                              </p>
                              {request.group?.description && typeof request.group.description === 'string' && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {request.group.description}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Created by: {(() => {
                                  const owner = request.group?.ownerId;
                                  if (owner && typeof owner === 'object' && owner !== null && 'firstName' in owner) {
                                    const ownerData = owner as { firstName: string; lastName: string };
                                    return `${ownerData.firstName} ${ownerData.lastName}`;
                                  } else if (owner && typeof owner === 'string') {
                                    return owner;
                                  }
                                  return 'Unknown User';
                                })()} • {formatDate(request.requestedAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleUserJoinRequestMutation.mutate({ id: request._id, status: 'accepted' })}
                              disabled={handleUserJoinRequestMutation.isPending}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUserJoinRequestMutation.mutate({ id: request._id, status: 'rejected' })}
                              disabled={handleUserJoinRequestMutation.isPending}
                              className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900"
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                      No join requests found.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Group Tasks Modal */}
      <Dialog open={!!selectedGroupForTasks} onOpenChange={() => setSelectedGroupForTasks(null)}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedGroupForTasks?.name} - Tasks
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {groupTasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No tasks in this group yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupTasks.map((task) => (
                  <Card key={task._id} className="glass-effect shadow-xl">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {task.title}
                        </h4>
                        <div className="flex space-x-1">
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          <Badge className={getTaskStatusColor(task.status)}>
                            {task.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {task.description}
                        </p>
                      )}
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 dark:text-gray-400">Assigned to:</span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {task.user?.firstName} {task.user?.lastName}
                          </span>
                        </div>
                        
                        {task.dueDate && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Due:</span>
                            <span className="text-gray-900 dark:text-white">
                              {formatDate(task.dueDate)}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {task.status !== 'completed' && (
                        <div className="flex space-x-2 mt-3">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => markTaskCompleteMutation.mutate(task._id)}
                            disabled={markTaskCompleteMutation.isPending}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Complete
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
