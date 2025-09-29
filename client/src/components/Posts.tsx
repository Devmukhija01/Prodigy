import { useState, useEffect } from 'react';
import { Plus, Calendar, Send, Edit, Trash2, Clock, CheckCircle, AlertCircle, Flag, CalendarDays, User, Tag } from 'lucide-react';
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
import { insertTaskSchema, Task, type InsertTask, type Group } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

export const Posts = () => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user from localStorage
  const getCurrentUserId = () => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        return parsed._id;
      } catch (error) {
        console.error("Error parsing userData:", error);
        return null;
      }
    }
    return null;
  };

  // Update user ID when component mounts or localStorage changes
  useEffect(() => {
    const userId = getCurrentUserId();
    setCurrentUserId(userId);
  }, []);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [taskType, setTaskType] = useState<'personal' | 'team'>('personal');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Listen for authentication changes
  useEffect(() => {
    const handleStorageChange = () => {
      const userId = getCurrentUserId();
      setCurrentUserId(userId);
    };

    const handleUserLogin = () => {
      const userId = getCurrentUserId();
      setCurrentUserId(userId);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLoggedIn', handleUserLogin);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLoggedIn', handleUserLogin);
    };
  }, []);

  // Get personal tasks (created by user, no group)
  const { data: personalTasks = [], isLoading: personalTasksLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks/user/personal', currentUserId],
    queryFn: async () => {
      if (!currentUserId) return [];
      const response = await axios.get(`http://localhost:5055/api/tasks/user/${currentUserId}/personal`, { withCredentials: true });
      return response.data;
    },
    enabled: !!currentUserId,
  });

  // Get user's groups for team selection
  const { data: userGroups = [] } = useQuery<Group[]>({
    queryKey: ['/api/groups/user', currentUserId],
    queryFn: async () => {
      if (!currentUserId) return [];
      const response = await axios.get(`http://localhost:5055/api/groups/user/${currentUserId}`, { withCredentials: true });
      return response.data;
    },
    enabled: !!currentUserId,
  });

  // Get team tasks (assigned to user from groups)
  const { data: teamTasks = [], isLoading: teamTasksLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks/user/team', currentUserId, selectedTeam],
    queryFn: async () => {
      if (!currentUserId) return [];
      const url = selectedTeam && selectedTeam !== 'all'
        ? `http://localhost:5055/api/tasks/user/${currentUserId}/team/${selectedTeam}`
        : `http://localhost:5055/api/tasks/user/${currentUserId}/team`;
      const response = await axios.get(url, { withCredentials: true });
      return response.data;
    },
    enabled: !!currentUserId,
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: Omit<InsertTask, 'userId'>) => {
      const taskData = {
        ...data,
        userId: currentUserId // Always create task for current user
      };
      console.log('Creating task with data:', taskData);
      const response = await axios.post('http://localhost:5055/api/tasks', taskData, { withCredentials: true });
      console.log('Task created successfully:', response.data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/user/personal', currentUserId] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/user/team', currentUserId] });
      setIsCreateOpen(false);
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

  // Edit task mutation
  const editTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Task> }) => {
      console.log('Updating task:', id, data);
      const response = await axios.patch(`http://localhost:5055/api/tasks/${id}`, data, { withCredentials: true });
      console.log('Task updated successfully:', response.data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/user/personal', currentUserId] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/user/team', currentUserId] });
      setIsEditOpen(false);
      toast({
        title: "Success",
        description: "Task updated successfully!",
      });
    },
    onError: (error) => {
      console.error('Task update error:', error);
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting task:', id);
      const response = await axios.delete(`http://localhost:5055/api/tasks/${id}`, { withCredentials: true });
      console.log('Task deleted successfully:', response.data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/user/personal', currentUserId] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/user/team', currentUserId] });
      toast({
        title: "Success",
        description: "Task deleted successfully!",
      });
    },
    onError: (error) => {
      console.error('Task deletion error:', error);
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<Omit<InsertTask, 'userId'>>({
    resolver: zodResolver(insertTaskSchema.omit({ userId: true })),
    defaultValues: {
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
    },
  });

  type EditTaskFormData = {
    title: string;
    description: string;
    status: 'pending' | 'completed' | 'in_progress';
    priority: 'low' | 'medium' | 'high';
    dueDate?: string;
  };

  const editForm = useForm<EditTaskFormData>({
    resolver: zodResolver(insertTaskSchema.omit({ userId: true })),
    defaultValues: {
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      dueDate: '',
    },
  });

  // Check if user is logged in - moved after all hooks
  if (!currentUserId) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Tasks</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Please log in to view and manage your tasks.</p>
        </div>
      </div>
    );
  }

  const onSubmit = (data: Omit<InsertTask, 'userId'>) => {
    createTaskMutation.mutate(data);
  };

  const onEditSubmit = (data: EditTaskFormData) => {
    if (editingTask) {
      const taskData = {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined
      };
      editTaskMutation.mutate({ id: editingTask._id, data: taskData });
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    editForm.reset({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    });
    setIsEditOpen(true);
  };

  const handleDelete = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  const currentTasks = taskType === 'personal' ? personalTasks : teamTasks;
  const isLoading = taskType === 'personal' ? personalTasksLoading : teamTasksLoading;

  const filteredTasks = currentTasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'draft':
        return <Edit className="w-4 h-4 text-gray-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-blue-500';
      case 'draft':
        return 'bg-gray-500';
      default:
        return 'bg-orange-500';
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tasks</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your Tasks</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg">
              <Plus size={16} className="mr-2" />
              Create Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
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
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your task..." 
                          rows={4} 
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
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            {/* <SelectItem value="completed">Completed</SelectItem> */}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
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
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
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

        {/* Edit Task Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <FormField
                  control={editForm.control}
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
                  control={editForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your task..." 
                          rows={4} 
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
                    control={editForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
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
                  control={editForm.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={editTaskMutation.isPending}>
                    {editTaskMutation.isPending ? 'Updating...' : 'Update Task'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Task Type and Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">Task Type:</span>
          <div className="flex space-x-2">
            {['personal', 'team'].map((type) => (
              <Button
                key={type}
                variant={taskType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setTaskType(type as typeof taskType);
                  setSelectedTeam('all'); // Reset team selection when switching types
                }}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)} Tasks
              </Button>
            ))}
          </div>
          
          {/* Team Selection Dropdown */}
          {taskType === 'team' && userGroups.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Team:</span>
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  {userGroups.map((group) => (
                    <SelectItem key={group._id} value={group._id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">Filter by:</span>
          <div className="flex space-x-2">
            {['all', 'completed', 'pending'].map((status) => (
              <Button
                key={status}
                variant={filter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(status as typeof filter)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="glass-effect shadow-xl animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <Send className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tasks found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {filter === 'all' 
                ? "Create your first task to get started!" 
              : `No ${filter} tasks found. Try a different filter.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <Card key={task._id} className="glass-effect shadow-xl hover:shadow-2xl transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                    {task.title}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(task.status)}
                    <Badge className={`${getStatusColor(task.status)} text-white`}>
                      {task.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
                  {task.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Flag className="w-4 h-4 text-gray-400" />
                    <Badge variant="secondary" className="text-xs">
                      {task.priority}
                    </Badge>
                  </div>
                  {task.dueDate && (
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <CalendarDays className="w-4 h-4" />
                      <span>Due: {formatDate(task.dueDate)}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Created: {formatDate(task.createdAt || new Date())}</span>
                </div>
                
                <div className="flex items-center space-x-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEdit(task)}
                    disabled={editTaskMutation.isPending}
                  >
                    <Edit size={14} className="mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDelete(task._id)}
                    disabled={deleteTaskMutation.isPending}
                  >
                    <Trash2 size={14} className="mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};