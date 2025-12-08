// import { useState, useEffect } from 'react';
// import { Plus, Calendar, Send, Edit, Trash2, Clock, CheckCircle, AlertCircle, Flag, CalendarDays, User, Tag } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { insertTaskSchema, Task, type InsertTask, type Group } from '@shared/schema';
// import { useToast } from '@/hooks/use-toast';
// import axios from 'axios';

// export const Posts = () => {
//   const [currentUserId, setCurrentUserId] = useState<string | null>(null);

//   // Get current user from localStorage
//   const getCurrentUserId = () => {
//     const userData = localStorage.getItem("userData");
//     if (userData) {
//       try {
//         const parsed = JSON.parse(userData);
//         return parsed._id;
//       } catch (error) {
//         console.error("Error parsing userData:", error);
//         return null;
//       }
//     }
//     return null;
//   };

//   // Update user ID when component mounts or localStorage changes
//   useEffect(() => {
//     const userId = getCurrentUserId();
//     setCurrentUserId(userId);
//   }, []);

//   const [isCreateOpen, setIsCreateOpen] = useState(false);
//   const [isEditOpen, setIsEditOpen] = useState(false);
//   const [editingTask, setEditingTask] = useState<Task | null>(null);
//   const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
//   const [taskType, setTaskType] = useState<'personal' | 'team'>('personal');
//   const [selectedTeam, setSelectedTeam] = useState<string>('all');
//   const { toast } = useToast();
//   const queryClient = useQueryClient();

//   // Listen for authentication changes
//   useEffect(() => {
//     const handleStorageChange = () => {
//       const userId = getCurrentUserId();
//       setCurrentUserId(userId);
//     };

//     const handleUserLogin = () => {
//       const userId = getCurrentUserId();
//       setCurrentUserId(userId);
//     };

//     window.addEventListener('storage', handleStorageChange);
//     window.addEventListener('userLoggedIn', handleUserLogin);
    
//     return () => {
//       window.removeEventListener('storage', handleStorageChange);
//       window.removeEventListener('userLoggedIn', handleUserLogin);
//     };
//   }, []);

//   // Get personal tasks (created by user, no group)
//   const { data: personalTasks = [], isLoading: personalTasksLoading } = useQuery<Task[]>({
//     queryKey: ['/api/tasks/user/personal', currentUserId],
//     queryFn: async () => {
//       if (!currentUserId) return [];
//       const response = await axios.get(`http://localhost:5055/api/tasks/user/${currentUserId}/personal`, { withCredentials: true });
//       return response.data;
//     },
//     enabled: !!currentUserId,
//   });

//   // Get user's groups for team selection
//   const { data: userGroups = [] } = useQuery<Group[]>({
//     queryKey: ['/api/groups/user', currentUserId],
//     queryFn: async () => {
//       if (!currentUserId) return [];
//       const response = await axios.get(`http://localhost:5055/api/groups/user/${currentUserId}`, { withCredentials: true });
//       return response.data;
//     },
//     enabled: !!currentUserId,
//   });

//   // Get team tasks (assigned to user from groups)
//   const { data: teamTasks = [], isLoading: teamTasksLoading } = useQuery<Task[]>({
//     queryKey: ['/api/tasks/user/team', currentUserId, selectedTeam],
//     queryFn: async () => {
//       if (!currentUserId) return [];
//       const url = selectedTeam && selectedTeam !== 'all'
//         ? `http://localhost:5055/api/tasks/user/${currentUserId}/team/${selectedTeam}`
//         : `http://localhost:5055/api/tasks/user/${currentUserId}/team`;
//       const response = await axios.get(url, { withCredentials: true });
//       return response.data;
//     },
//     enabled: !!currentUserId,
//   });

//   const createTaskMutation = useMutation({
//     mutationFn: async (data: Omit<InsertTask, 'userId'>) => {
//       const taskData = {
//         ...data,
//         userId: currentUserId // Always create task for current user
//       };
//       console.log('Creating task with data:', taskData);
//       const response = await axios.post('http://localhost:5055/api/tasks', taskData, { withCredentials: true });
//       console.log('Task created successfully:', response.data);
//       return response.data;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['/api/tasks/user/personal', currentUserId] });
//       queryClient.invalidateQueries({ queryKey: ['/api/tasks/user/team', currentUserId] });
//       setIsCreateOpen(false);
//       toast({
//         title: "Success",
//         description: "Task created successfully!",
//       });
//     },
//     onError: (error) => {
//       console.error('Task creation error:', error);
//       toast({
//         title: "Error",
//         description: "Failed to create task. Please try again.",
//         variant: "destructive",
//       });
//     },
//   });

//   // Edit task mutation
//   const editTaskMutation = useMutation({
//     mutationFn: async ({ id, data }: { id: string; data: Partial<Task> }) => {
//       console.log('Updating task:', id, data);
//       const response = await axios.patch(`http://localhost:5055/api/tasks/${id}`, data, { withCredentials: true });
//       console.log('Task updated successfully:', response.data);
//       return response.data;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['/api/tasks/user/personal', currentUserId] });
//       queryClient.invalidateQueries({ queryKey: ['/api/tasks/user/team', currentUserId] });
//       setIsEditOpen(false);
//       toast({
//         title: "Success",
//         description: "Task updated successfully!",
//       });
//     },
//     onError: (error) => {
//       console.error('Task update error:', error);
//       toast({
//         title: "Error",
//         description: "Failed to update task. Please try again.",
//         variant: "destructive",
//       });
//     },
//   });

//   // Delete task mutation
//   const deleteTaskMutation = useMutation({
//     mutationFn: async (id: string) => {
//       console.log('Deleting task:', id);
//       const response = await axios.delete(`http://localhost:5055/api/tasks/${id}`, { withCredentials: true });
//       console.log('Task deleted successfully:', response.data);
//       return response.data;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['/api/tasks/user/personal', currentUserId] });
//       queryClient.invalidateQueries({ queryKey: ['/api/tasks/user/team', currentUserId] });
//       toast({
//         title: "Success",
//         description: "Task deleted successfully!",
//       });
//     },
//     onError: (error) => {
//       console.error('Task deletion error:', error);
//       toast({
//         title: "Error",
//         description: "Failed to delete task. Please try again.",
//         variant: "destructive",
//       });
//     },
//   });

//   const form = useForm<Omit<InsertTask, 'userId'>>({
//     resolver: zodResolver(insertTaskSchema.omit({ userId: true })),
//     defaultValues: {
//       title: '',
//       description: '',
//       status: 'pending',
//       priority: 'medium',
//     },
//   });

//   type EditTaskFormData = {
//     title: string;
//     description: string;
//     status: 'pending' | 'completed' | 'in_progress';
//     priority: 'low' | 'medium' | 'high';
//     dueDate?: string;
//   };

//   const editForm = useForm<EditTaskFormData>({
//     resolver: zodResolver(insertTaskSchema.omit({ userId: true })),
//     defaultValues: {
//       title: '',
//       description: '',
//       status: 'pending',
//       priority: 'medium',
//       dueDate: '',
//     },
//   });

//   // Check if user is logged in - moved after all hooks
//   if (!currentUserId) {
//     return (
//       <div className="max-w-7xl mx-auto space-y-8">
//         <div className="text-center py-12">
//           <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Tasks</h1>
//           <p className="text-gray-600 dark:text-gray-400 mb-8">Please log in to view and manage your tasks.</p>
//         </div>
//       </div>
//     );
//   }

//   const onSubmit = (data: Omit<InsertTask, 'userId'>) => {
//     createTaskMutation.mutate(data);
//   };

//   const onEditSubmit = (data: EditTaskFormData) => {
//     if (editingTask) {
//       const taskData = {
//         ...data,
//         dueDate: data.dueDate ? new Date(data.dueDate) : undefined
//       };
//       editTaskMutation.mutate({ id: editingTask._id, data: taskData });
//     }
//   };

//   const handleEdit = (task: Task) => {
//     setEditingTask(task);
//     editForm.reset({
//       title: task.title,
//       description: task.description || '',
//       status: task.status,
//       priority: task.priority,
//       dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
//     });
//     setIsEditOpen(true);
//   };

//   const handleDelete = (taskId: string) => {
//     if (confirm('Are you sure you want to delete this task?')) {
//       deleteTaskMutation.mutate(taskId);
//     }
//   };

//   const currentTasks = taskType === 'personal' ? personalTasks : teamTasks;
//   const isLoading = taskType === 'personal' ? personalTasksLoading : teamTasksLoading;

//   const filteredTasks = currentTasks.filter(task => {
//     if (filter === 'all') return true;
//     return task.status === filter;
//   });

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case 'completed':
//         return <CheckCircle className="w-4 h-4 text-green-500" />;
//       case 'pending':
//         return <Clock className="w-4 h-4 text-blue-500" />;
//       case 'draft':
//         return <Edit className="w-4 h-4 text-gray-500" />;
//       default:
//         return <AlertCircle className="w-4 h-4 text-orange-500" />;
//     }
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'completed':
//         return 'bg-green-500';
//       case 'pending':
//         return 'bg-blue-500';
//       case 'draft':
//         return 'bg-gray-500';
//       default:
//         return 'bg-orange-500';
//     }
//   };

//   const formatDate = (date: Date | string) => {
//     return new Date(date).toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   return (
//     <div className="max-w-7xl mx-auto space-y-8">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tasks</h1>
//           <p className="text-gray-600 dark:text-gray-400">Manage your Tasks</p>
//         </div>
//         <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
//           <DialogTrigger asChild>
//             <Button className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg">
//               <Plus size={16} className="mr-2" />
//               Create Task
//             </Button>
//           </DialogTrigger>
//           <DialogContent className="sm:max-w-[600px]">
//             <DialogHeader>
//               <DialogTitle>Create New Task</DialogTitle>
//             </DialogHeader>
//             <Form {...form}>
//               <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//                 <FormField
//                   control={form.control}
//                   name="title"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Task Title</FormLabel>
//                       <FormControl>
//                         <Input placeholder="Enter task title" {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={form.control}
//                   name="description"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Description</FormLabel>
//                       <FormControl>
//                         <Textarea 
//                           placeholder="Describe your task..." 
//                           rows={4} 
//                           {...field}
//                           value={field.value || ''}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <div className="grid grid-cols-2 gap-4">
//                   <FormField
//                     control={form.control}
//                     name="status"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Status</FormLabel>
//                         <Select onValueChange={field.onChange} defaultValue={field.value}>
//                           <FormControl>
//                             <SelectTrigger>
//                               <SelectValue placeholder="Select status" />
//                             </SelectTrigger>
//                           </FormControl>
//                           <SelectContent>
//                             <SelectItem value="pending">Pending</SelectItem>
//                             {/* <SelectItem value="completed">Completed</SelectItem> */}
//                           </SelectContent>
//                         </Select>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={form.control}
//                     name="priority"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Priority</FormLabel>
//                         <Select onValueChange={field.onChange} defaultValue={field.value}>
//                           <FormControl>
//                             <SelectTrigger>
//                               <SelectValue placeholder="Select priority" />
//                             </SelectTrigger>
//                           </FormControl>
//                           <SelectContent>
//                             <SelectItem value="low">Low</SelectItem>
//                             <SelectItem value="medium">Medium</SelectItem>
//                             <SelectItem value="high">High</SelectItem>
//                           </SelectContent>
//                         </Select>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 </div>
//                 <FormField
//                   control={form.control}
//                   name="dueDate"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Due Date</FormLabel>
//                       <FormControl>
//                         <Input 
//                           type="date" 
//                           {...field} 
//                           value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
//                           onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <div className="flex justify-end space-x-2">
//                   <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
//                     Cancel
//                   </Button>
//                   <Button type="submit" disabled={createTaskMutation.isPending}>
//                     {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
//                   </Button>
//                 </div>
//               </form>
//             </Form>
//           </DialogContent>
//         </Dialog>

//         {/* Edit Task Dialog */}
//         <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
//           <DialogContent className="sm:max-w-[600px]">
//             <DialogHeader>
//               <DialogTitle>Edit Task</DialogTitle>
//             </DialogHeader>
//             <Form {...editForm}>
//               <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
//                 <FormField
//                   control={editForm.control}
//                   name="title"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Task Title</FormLabel>
//                       <FormControl>
//                         <Input placeholder="Enter task title" {...field} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <FormField
//                   control={editForm.control}
//                   name="description"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Description</FormLabel>
//                       <FormControl>
//                         <Textarea 
//                           placeholder="Describe your task..." 
//                           rows={4} 
//                           {...field}
//                           value={field.value || ''}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <div className="grid grid-cols-2 gap-4">
//                   <FormField
//                     control={editForm.control}
//                     name="status"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Status</FormLabel>
//                         <Select onValueChange={field.onChange} defaultValue={field.value}>
//                           <FormControl>
//                             <SelectTrigger>
//                               <SelectValue placeholder="Select status" />
//                             </SelectTrigger>
//                           </FormControl>
//                           <SelectContent>
//                             <SelectItem value="pending">Pending</SelectItem>
//                             <SelectItem value="completed">Completed</SelectItem>
//                           </SelectContent>
//                         </Select>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                   <FormField
//                     control={editForm.control}
//                     name="priority"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Priority</FormLabel>
//                         <Select onValueChange={field.onChange} defaultValue={field.value}>
//                           <FormControl>
//                             <SelectTrigger>
//                               <SelectValue placeholder="Select priority" />
//                             </SelectTrigger>
//                           </FormControl>
//                           <SelectContent>
//                             <SelectItem value="low">Low</SelectItem>
//                             <SelectItem value="medium">Medium</SelectItem>
//                             <SelectItem value="high">High</SelectItem>
//                           </SelectContent>
//                         </Select>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 </div>
//                 <FormField
//                   control={editForm.control}
//                   name="dueDate"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Due Date</FormLabel>
//                       <FormControl>
//                         <Input 
//                           type="date" 
//                           {...field} 
//                           value={field.value || ''}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//                 <div className="flex justify-end space-x-2">
//                   <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
//                     Cancel
//                   </Button>
//                   <Button type="submit" disabled={editTaskMutation.isPending}>
//                     {editTaskMutation.isPending ? 'Updating...' : 'Update Task'}
//                   </Button>
//                 </div>
//               </form>
//             </Form>
//           </DialogContent>
//         </Dialog>
//       </div>

//       {/* Task Type and Filters */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center space-x-4">
//           <span className="text-sm text-gray-600 dark:text-gray-400">Task Type:</span>
//           <div className="flex space-x-2">
//             {['personal', 'team'].map((type) => (
//               <Button
//                 key={type}
//                 variant={taskType === type ? 'default' : 'outline'}
//                 size="sm"
//                 onClick={() => {
//                   setTaskType(type as typeof taskType);
//                   setSelectedTeam('all'); // Reset team selection when switching types
//                 }}
//               >
//                 {type.charAt(0).toUpperCase() + type.slice(1)} Tasks
//               </Button>
//             ))}
//           </div>
          
//           {/* Team Selection Dropdown */}
//           {taskType === 'team' && userGroups.length > 0 && (
//             <div className="flex items-center space-x-2">
//               <span className="text-sm text-gray-600 dark:text-gray-400">Team:</span>
//               <Select value={selectedTeam} onValueChange={setSelectedTeam}>
//                 <SelectTrigger className="w-48">
//                   <SelectValue placeholder="Select a team" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Teams</SelectItem>
//                   {userGroups.map((group) => (
//                     <SelectItem key={group._id} value={group._id}>
//                       {group.name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           )}
//         </div>
        
//         <div className="flex items-center space-x-4">
//           <span className="text-sm text-gray-600 dark:text-gray-400">Filter by:</span>
//           <div className="flex space-x-2">
//             {['all', 'completed', 'pending'].map((status) => (
//               <Button
//                 key={status}
//                 variant={filter === status ? 'default' : 'outline'}
//                 size="sm"
//                 onClick={() => setFilter(status as typeof filter)}
//               >
//                 {status.charAt(0).toUpperCase() + status.slice(1)}
//               </Button>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Posts Grid */}
//       {isLoading ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {Array.from({ length: 6 }).map((_, i) => (
//             <Card key={i} className="glass-effect shadow-xl animate-pulse">
//               <CardHeader>
//                 <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-2">
//                   <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
//                   <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       ) : filteredTasks.length === 0 ? (
//         <div className="text-center py-12">
//           <Send className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
//           <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tasks found</h3>
//           <p className="text-gray-500 dark:text-gray-400">
//             {filter === 'all' 
//                 ? "Create your first task to get started!" 
//               : `No ${filter} tasks found. Try a different filter.`}
//           </p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {filteredTasks.map((task) => (
//             <Card key={task._id} className="glass-effect shadow-xl hover:shadow-2xl transition-shadow">
//               <CardHeader className="pb-3">
//                 <div className="flex items-center justify-between">
//                   <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white truncate">
//                     {task.title}
//                   </CardTitle>
//                   <div className="flex items-center space-x-2">
//                     {getStatusIcon(task.status)}
//                     <Badge className={`${getStatusColor(task.status)} text-white`}>
//                       {task.status}
//                     </Badge>
//                   </div>
//                 </div>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
//                   {task.description}
//                 </p>
                
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center space-x-2">
//                     <Flag className="w-4 h-4 text-gray-400" />
//                     <Badge variant="secondary" className="text-xs">
//                       {task.priority}
//                     </Badge>
//                   </div>
//                   {task.dueDate && (
//                     <div className="flex items-center space-x-2 text-sm text-gray-500">
//                       <CalendarDays className="w-4 h-4" />
//                       <span>Due: {formatDate(task.dueDate)}</span>
//                     </div>
//                   )}
//                 </div>
                
//                 <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
//                   <span>Created: {formatDate(task.createdAt || new Date())}</span>
//                 </div>
                
//                 <div className="flex items-center space-x-2 pt-2">
//                   <Button 
//                     size="sm" 
//                     variant="outline"
//                     onClick={() => handleEdit(task)}
//                     disabled={editTaskMutation.isPending}
//                   >
//                     <Edit size={14} className="mr-1" />
//                     Edit
//                   </Button>
//                   <Button 
//                     size="sm" 
//                     variant="outline"
//                     onClick={() => handleDelete(task._id)}
//                     disabled={deleteTaskMutation.isPending}
//                   >
//                     <Trash2 size={14} className="mr-1" />
//                     Delete
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };



// import { useState, useEffect } from 'react';
// import { 
//   Plus, Calendar, Send, Edit, Trash2, Clock, CheckCircle, 
//   AlertCircle, Flag, CalendarDays, User, Tag, Paperclip, 
//   GripVertical, X, CheckSquare, Square, MoreHorizontal,
//   ChevronDown, ChevronUp, Filter, Search, LayoutGrid, List,
//   Briefcase, Layers, ArrowRight, Circle, Trash
// } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { Separator } from '@/components/ui/separator';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { useToast } from '@/hooks/use-toast';
// import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
// import { cn } from '@/lib/utils';
// import { format } from 'date-fns';
// import { Progress } from "@/components/ui/progress";

// // Mock types
// interface Subtask {
//   id: string;
//   title: string;
//   completed: boolean;
// }

// interface Attachment {
//   id: string;
//   name: string;
//   type: string;
//   url: string;
// }

// interface Task {
//   _id: string;
//   title: string;
//   description: string;
//   status: 'pending' | 'in_progress' | 'completed';
//   priority: 'low' | 'medium' | 'high';
//   dueDate?: Date;
//   subtasks: Subtask[];
//   attachments: Attachment[];
//   assignee?: string;
//   tags: string[];
//   createdAt: Date;
// }

// // Mock data
// const generateMockTasks = (): Task[] => [
//   {
//     _id: '1',
//     title: 'Design System Update',
//     description: 'Refresh the color palette and typography scale for the new dashboard.',
//     status: 'pending',
//     priority: 'high',
//     dueDate: new Date(Date.now() + 86400000 * 2),
//     subtasks: [
//       { id: 'st-1', title: 'Audit existing colors', completed: true },
//       { id: 'st-2', title: 'Propose new accessible palette', completed: false },
//       { id: 'st-3', title: 'Update Tailwind config', completed: false },
//     ],
//     attachments: [],
//     tags: ['Design', 'System'],
//     assignee: 'Alex',
//     createdAt: new Date(),
//   },
//   {
//     _id: '2',
//     title: 'Implement Authentication',
//     description: 'Setup JWT based auth using Passport.js and Express.',
//     status: 'in_progress',
//     priority: 'high',
//     subtasks: [],
//     attachments: [{ id: 'att-1', name: 'auth-flow-diagram.png', type: 'image/png', url: '#' }],
//     tags: ['Backend', 'Security'],
//     assignee: 'Sam',
//     createdAt: new Date(),
//   },
//   {
//     _id: '3',
//     title: 'Fix Navigation Bug',
//     description: 'Mobile menu does not close when clicking outside.',
//     status: 'completed',
//     priority: 'medium',
//     subtasks: [{ id: 'st-3', title: 'Reproduce issue on iOS', completed: true }],
//     attachments: [],
//     tags: ['Bug', 'Mobile'],
//     assignee: 'Jordan',
//     createdAt: new Date(),
//   },
//   {
//     _id: '4',
//     title: 'Q3 Marketing Plan',
//     description: 'Draft the content strategy for the upcoming quarter.',
//     status: 'pending',
//     priority: 'low',
//     subtasks: [],
//     attachments: [],
//     tags: ['Marketing'],
//     assignee: 'Taylor',
//     createdAt: new Date(),
//   },
// ];

// const taskSchema = z.object({
//   title: z.string().min(1, "Title is required"),
//   description: z.string().optional(),
//   status: z.enum(['pending', 'in_progress', 'completed']),
//   priority: z.enum(['low', 'medium', 'high']),
//   dueDate: z.string().optional(),
//   tags: z.string().optional(),
// });

// type TaskFormData = z.infer<typeof taskSchema>;

// export function Posts() {
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [isCreateOpen, setIsCreateOpen] = useState(false);
//   const [editingTask, setEditingTask] = useState<Task | null>(null);
//   const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
//   const { toast } = useToast();

//   useEffect(() => {
//     const savedTasks = localStorage.getItem('mockTasks');
//     if (savedTasks) {
//       setTasks(JSON.parse(savedTasks, (key, value) => {
//         if (key === 'dueDate' || key === 'createdAt') return new Date(value);
//         return value;
//       }));
//     } else {
//       setTasks(generateMockTasks());
//     }
//   }, []);

//   useEffect(() => {
//     if (tasks.length > 0) {
//       localStorage.setItem('mockTasks', JSON.stringify(tasks));
//     }
//   }, [tasks]);

//   const form = useForm<TaskFormData>({
//     resolver: zodResolver(taskSchema),
//     defaultValues: {
//       title: '',
//       description: '',
//       status: 'pending',
//       priority: 'medium',
//     },
//   });

//   const onSubmit = (data: TaskFormData) => {
//     const newTask: Task = {
//       _id: Math.random().toString(36).substr(2, 9),
//       title: data.title,
//       description: data.description || '',
//       status: data.status,
//       priority: data.priority,
//       dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
//       subtasks: [],
//       attachments: [],
//       tags: data.tags ? data.tags.split(',').map(t => t.trim()) : [],
//       createdAt: new Date(),
//       assignee: 'Me', // Mock default
//     };

//     setTasks((prev) => [...prev, newTask]);
//     setIsCreateOpen(false);
//     form.reset();
//     toast({
//       title: "Task Created",
//       description: "Your new task has been added to the board.",
//     });
//   };

//   const onUpdate = (data: TaskFormData) => {
//     if (!editingTask) return;

//     setTasks((prev) => prev.map(t => 
//       t._id === editingTask._id 
//         ? { 
//             ...t, 
//             ...data, 
//             dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
//             tags: data.tags ? data.tags.split(',').map(t => t.trim()) : t.tags 
//           } 
//         : t
//     ));
//     setEditingTask(null);
//     toast({
//       title: "Task Updated",
//       description: "Changes have been saved.",
//     });
//   };

//   const deleteTask = (id: string) => {
//     setTasks((prev) => prev.filter(t => t._id !== id));
//     toast({
//       title: "Task Deleted",
//       description: "The task has been removed.",
//     });
//   };

//   const handleDragEnd = (result: DropResult) => {
//     if (!result.destination) return;

//     const { source, destination } = result;

//     if (source.droppableId === destination.droppableId) return;

//     const taskId = result.draggableId;
//     const newStatus = destination.droppableId as Task['status'];

//     setTasks((prev) => prev.map(t => 
//       t._id === taskId ? { ...t, status: newStatus } : t
//     ));
//   };

//   const addSubtask = (taskId: string, title: string) => {
//     if (!title.trim()) return;
//     setTasks(prev => prev.map(t => {
//       if (t._id === taskId) {
//         return {
//           ...t,
//           subtasks: [...t.subtasks, { id: Math.random().toString(36).substr(2, 9), title, completed: false }]
//         };
//       }
//       return t;
//     }));
//   };

//   const toggleSubtask = (taskId: string, subtaskId: string) => {
//     setTasks(prev => prev.map(t => {
//       if (t._id === taskId) {
//         return {
//           ...t,
//           subtasks: t.subtasks.map(st => st.id === subtaskId ? { ...st, completed: !st.completed } : st)
//         };
//       }
//       return t;
//     }));
//   };
  
//   const deleteSubtask = (taskId: string, subtaskId: string) => {
//     setTasks(prev => prev.map(t => {
//       if (t._id === taskId) {
//         return {
//           ...t,
//           subtasks: t.subtasks.filter(st => st.id !== subtaskId)
//         };
//       }
//       return t;
//     }));
//   };

//   const addAttachment = (taskId: string, file: File) => {
//     setTasks(prev => prev.map(t => {
//       if (t._id === taskId) {
//         return {
//           ...t,
//           attachments: [...t.attachments, { 
//             id: Math.random().toString(36).substr(2, 9), 
//             name: file.name, 
//             type: file.type,
//             url: URL.createObjectURL(file) 
//           }]
//         };
//       }
//       return t;
//     }));
//   };

//   const columns = [
//     { id: 'pending', title: 'To Do', count: tasks.filter(t => t.status === 'pending').length },
//     { id: 'in_progress', title: 'In Progress', count: tasks.filter(t => t.status === 'in_progress').length },
//     { id: 'completed', title: 'Done', count: tasks.filter(t => t.status === 'completed').length },
//   ];

//   return (
//     <div className="min-h-screen bg-background font-sans text-foreground flex flex-col">
      
//       {/* Navbar */}
//       <header className="h-16 border-b bg-background/80 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between">
//         <div className="flex items-center gap-2">
//           <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
//             <Layers className="h-5 w-5" />
//           </div>
//           <span className="font-bold text-lg tracking-tight">TaskFlow</span>
//           <span className="mx-2 text-muted-foreground/40">/</span>
//           <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
//             <Briefcase className="h-3.5 w-3.5" /> Projects
//           </span>
//         </div>
//         <div className="flex items-center gap-4">
//           <div className="relative hidden md:block">
//             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//             <Input placeholder="Search tasks..." className="pl-9 w-64 bg-muted/50 border-transparent focus:bg-background focus:border-input transition-all" />
//           </div>
//           <div className="flex items-center gap-2">
//             <Button variant="ghost" size="icon" className="rounded-full">
//               <Avatar className="h-8 w-8">
//                 <AvatarImage src="https://github.com/shadcn.png" />
//                 <AvatarFallback>CN</AvatarFallback>
//               </Avatar>
//             </Button>
//           </div>
//         </div>
//       </header>

//       <main className="flex-1 p-6 lg:p-8 overflow-hidden flex flex-col">
        
//         {/* Toolbar */}
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight text-foreground">Sprint Board</h1>
//             <p className="text-muted-foreground mt-1">Manage tasks and track progress for Q3 Sprint.</p>
//           </div>
          
//           <div className="flex items-center gap-3">
//             <div className="flex items-center bg-muted/50 p-1 rounded-md border">
//               <Button 
//                 variant={viewMode === 'board' ? 'secondary' : 'ghost'} 
//                 size="sm" 
//                 onClick={() => setViewMode('board')}
//                 className="h-8 px-3 text-xs font-medium shadow-none"
//               >
//                 <LayoutGrid className="h-3.5 w-3.5 mr-2" /> Board
//               </Button>
//               <Button 
//                 variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
//                 size="sm" 
//                 onClick={() => setViewMode('list')}
//                 className="h-8 px-3 text-xs font-medium shadow-none"
//               >
//                 <List className="h-3.5 w-3.5 mr-2" /> List
//               </Button>
//             </div>
            
//             <Separator orientation="vertical" className="h-8" />

//             <Button variant="outline" size="sm" className="h-9 gap-2 hidden sm:flex">
//               <Filter className="h-3.5 w-3.5" /> Filter
//             </Button>

//             <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
//               <DialogTrigger asChild>
//                 <Button className="h-9 gap-2 shadow-sm hover:shadow-md transition-all">
//                   <Plus className="h-4 w-4" /> New Task
//                 </Button>
//               </DialogTrigger>
//               <DialogContent className="sm:max-w-[600px]">
//                 <DialogHeader>
//                   <DialogTitle>Create Task</DialogTitle>
//                   <DialogDescription>Add a new task to your sprint board.</DialogDescription>
//                 </DialogHeader>
//                 <Form {...form}>
//                   <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-4">
//                     <FormField
//                       control={form.control}
//                       name="title"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Task Title</FormLabel>
//                           <FormControl>
//                             <Input placeholder="e.g. Update API Documentation" {...field} className="font-medium" />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                     <div className="grid grid-cols-2 gap-4">
//                       <FormField
//                         control={form.control}
//                         name="status"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Status</FormLabel>
//                             <Select onValueChange={field.onChange} defaultValue={field.value}>
//                               <FormControl>
//                                 <SelectTrigger>
//                                   <SelectValue />
//                                 </SelectTrigger>
//                               </FormControl>
//                               <SelectContent>
//                                 <SelectItem value="pending">To Do</SelectItem>
//                                 <SelectItem value="in_progress">In Progress</SelectItem>
//                                 <SelectItem value="completed">Done</SelectItem>
//                               </SelectContent>
//                             </Select>
//                           </FormItem>
//                         )}
//                       />
//                       <FormField
//                         control={form.control}
//                         name="priority"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Priority</FormLabel>
//                             <Select onValueChange={field.onChange} defaultValue={field.value}>
//                               <FormControl>
//                                 <SelectTrigger>
//                                   <SelectValue />
//                                 </SelectTrigger>
//                               </FormControl>
//                               <SelectContent>
//                                 <SelectItem value="low">Low</SelectItem>
//                                 <SelectItem value="medium">Medium</SelectItem>
//                                 <SelectItem value="high">High</SelectItem>
//                               </SelectContent>
//                             </Select>
//                           </FormItem>
//                         )}
//                       />
//                     </div>
//                     <FormField
//                       control={form.control}
//                       name="dueDate"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Due Date</FormLabel>
//                           <FormControl>
//                             <Input type="date" {...field} />
//                           </FormControl>
//                         </FormItem>
//                       )}
//                     />
//                      <FormField
//                       control={form.control}
//                       name="tags"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Tags (comma separated)</FormLabel>
//                           <FormControl>
//                             <Input placeholder="Design, Frontend, API" {...field} />
//                           </FormControl>
//                         </FormItem>
//                       )}
//                     />
//                     <FormField
//                       control={form.control}
//                       name="description"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Description</FormLabel>
//                           <FormControl>
//                             <Textarea placeholder="Add context..." className="min-h-[100px] resize-none" {...field} />
//                           </FormControl>
//                         </FormItem>
//                       )}
//                     />
//                     <DialogFooter>
//                       <Button type="submit" className="w-full sm:w-auto">Create Task</Button>
//                     </DialogFooter>
//                   </form>
//                 </Form>
//               </DialogContent>
//             </Dialog>
//           </div>
//         </div>

//         {/* Kanban Board */}
//         <ScrollArea className="flex-1 -mx-6 px-6 pb-6">
//           <DragDropContext onDragEnd={handleDragEnd}>
//             <div className="flex gap-6 min-w-[1000px] h-full">
//               {columns.map((column) => (
//                 <div key={column.id} className="flex-1 flex flex-col min-w-[320px]">
//                   {/* Column Header */}
//                   <div className="flex items-center justify-between mb-4 px-1">
//                     <div className="flex items-center gap-2">
//                       <span className={cn(
//                         "h-2.5 w-2.5 rounded-full ring-2 ring-opacity-50",
//                         column.id === 'pending' ? 'bg-slate-500 ring-slate-200' :
//                         column.id === 'in_progress' ? 'bg-blue-500 ring-blue-200' :
//                         'bg-green-500 ring-green-200'
//                       )} />
//                       <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
//                         {column.title}
//                       </h3>
//                       <Badge variant="secondary" className="ml-1 px-1.5 min-w-[20px] justify-center h-5 text-[10px] font-bold rounded-md">
//                         {column.count}
//                       </Badge>
//                     </div>
//                     <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
//                       <Plus className="h-4 w-4" />
//                     </Button>
//                   </div>

//                   {/* Droppable Area */}
//                   <Droppable droppableId={column.id}>
//                     {(provided, snapshot) => (
//                       <div
//                         {...provided.droppableProps}
//                         ref={provided.innerRef}
//                         className={cn(
//                           "flex-1 rounded-xl transition-colors p-1.5 bg-muted/30 border border-dashed border-border/60",
//                           snapshot.isDraggingOver ? "bg-muted/60 border-primary/30" : ""
//                         )}
//                       >
//                         <div className="space-y-3">
//                           {tasks
//                             .filter((task) => task.status === column.id)
//                             .map((task, index) => (
//                               <TaskCard 
//                                 key={task._id} 
//                                 task={task} 
//                                 index={index} 
//                                 onEdit={() => setEditingTask(task)}
//                                 onDelete={() => deleteTask(task._id)}
//                                 onAddSubtask={addSubtask}
//                                 onToggleSubtask={toggleSubtask}
//                                 onDeleteSubtask={deleteSubtask}
//                                 onAddAttachment={addAttachment}
//                               />
//                             ))}
//                         </div>
//                         {provided.placeholder}
                        
//                         {/* Quick Add Button at bottom of column */}
//                         <Button 
//                           variant="ghost" 
//                           className="w-full justify-start text-muted-foreground hover:text-foreground mt-2 h-9 text-sm font-normal"
//                           onClick={() => {
//                             form.setValue('status', column.id as any);
//                             setIsCreateOpen(true);
//                           }}
//                         >
//                           <Plus className="h-3.5 w-3.5 mr-2" /> Add Task
//                         </Button>
//                       </div>
//                     )}
//                   </Droppable>
//                 </div>
//               ))}
//             </div>
//           </DragDropContext>
//         </ScrollArea>

//         {/* Edit Dialog */}
//         {editingTask && (
//           <EditTaskDialog 
//             task={editingTask} 
//             open={!!editingTask} 
//             onOpenChange={(open) => !open && setEditingTask(null)}
//             onSave={onUpdate}
//             onAddSubtask={addSubtask}
//             onToggleSubtask={toggleSubtask}
//             onDeleteSubtask={deleteSubtask}
//           />
//         )}
//       </main>
//     </div>
//   );
// }

// function TaskCard({ 
//   task, 
//   index, 
//   onEdit, 
//   onDelete, 
//   onAddSubtask, 
//   onToggleSubtask, 
//   onDeleteSubtask,
//   onAddAttachment 
// }: { 
//   task: Task; 
//   index: number; 
//   onEdit: () => void; 
//   onDelete: () => void; 
//   onAddSubtask: (id: string, title: string) => void; 
//   onToggleSubtask: (id: string, sid: string) => void; 
//   onDeleteSubtask: (id: string, sid: string) => void;
//   onAddAttachment: (id: string, file: File) => void; 
// }) {
//   const [newSubtask, setNewSubtask] = useState('');
//   const [showDetails, setShowDetails] = useState(false);

//   const completedSubtasks = task.subtasks.filter(s => s.completed).length;
//   const totalSubtasks = task.subtasks.length;
//   const progress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       onAddAttachment(task._id, e.target.files[0]);
//     }
//   };

//   const PriorityBadge = ({ priority }: { priority: string }) => {
//     const config = {
//       high: { color: 'text-red-600 bg-red-50 border-red-100', icon: AlertCircle },
//       medium: { color: 'text-amber-600 bg-amber-50 border-amber-100', icon: Clock },
//       low: { color: 'text-blue-600 bg-blue-50 border-blue-100', icon: Flag },
//     };
//     const { color, icon: Icon } = config[priority as keyof typeof config];
//     return (
//       <Badge variant="outline" className={cn("capitalize gap-1 pr-2 h-5 font-medium border", color)}>
//         <Icon className="w-3 h-3" /> {priority}
//       </Badge>
//     );
//   };

//   return (
//     <Draggable draggableId={task._id} index={index}>
//       {(provided, snapshot) => (
//         <div
//           ref={provided.innerRef}
//           {...provided.draggableProps}
//           {...provided.dragHandleProps}
//           style={provided.draggableProps.style}
//           className={cn("outline-none", snapshot.isDragging && "z-50")}
//         >
//           <Card className={cn(
//             "group bg-card hover:shadow-md transition-all duration-200 border-border/60 shadow-sm",
//             snapshot.isDragging ? "shadow-xl ring-2 ring-primary/20 rotate-1 scale-105" : ""
//           )}>
//             <CardContent className="p-3.5 space-y-3">
//               {/* Header: Tags & Priority */}
//               <div className="flex items-start justify-between gap-2">
//                 <div className="flex flex-wrap gap-1.5">
//                    <PriorityBadge priority={task.priority} />
//                    {(task.tags || []).slice(0, 2).map(tag => (
//                      <Badge key={tag} variant="secondary" className="h-5 text-[10px] font-normal bg-muted text-muted-foreground border-transparent">
//                        {tag}
//                      </Badge>
//                    ))}
//                 </div>
//                 <DropdownMenu>
//                   <DropdownMenuTrigger asChild>
//                     <Button variant="ghost" size="icon" className="h-6 w-6 -mr-1 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
//                       <MoreHorizontal className="h-3.5 w-3.5" />
//                     </Button>
//                   </DropdownMenuTrigger>
//                   <DropdownMenuContent align="end">
//                     <DropdownMenuItem onClick={onEdit}>Edit Task</DropdownMenuItem>
//                     <DropdownMenuSeparator />
//                     <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={onDelete}>
//                       Delete Task
//                     </DropdownMenuItem>
//                   </DropdownMenuContent>
//                 </DropdownMenu>
//               </div>
              
//               {/* Title */}
//               <div>
//                 <h4 
//                   className="font-semibold text-sm text-foreground leading-snug hover:text-primary cursor-pointer transition-colors"
//                   onClick={() => setShowDetails(!showDetails)}
//                 >
//                   {task.title}
//                 </h4>
//                 {task.description && !showDetails && (
//                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">{task.description}</p>
//                 )}
//               </div>

//               {/* Footer: Meta info */}
//               <div className="flex items-center justify-between pt-1">
//                 <div className="flex items-center gap-3">
//                    {/* Assignee */}
//                    <Avatar className="h-5 w-5 border border-background">
//                       <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
//                         {task.assignee ? task.assignee.substring(0, 2).toUpperCase() : 'UN'}
//                       </AvatarFallback>
//                    </Avatar>
                   
//                    {/* Date */}
//                    {task.dueDate && (
//                      <div className={cn(
//                        "flex items-center gap-1 text-[10px] font-medium",
//                        new Date(task.dueDate) < new Date() ? "text-red-500" : "text-muted-foreground"
//                      )}>
//                        <Calendar className="w-3 h-3" />
//                        {format(new Date(task.dueDate), 'MMM d')}
//                      </div>
//                    )}
//                 </div>

//                 <div className="flex items-center gap-2">
//                   {/* Subtask indicator with visual progress */}
//                   {(totalSubtasks > 0 || showDetails) && (
//                     <div className={cn(
//                       "flex items-center gap-1.5 text-[10px] px-1.5 py-0.5 rounded-md transition-colors border border-transparent",
//                       progress === 100 ? "bg-green-50 text-green-600 border-green-100" : "bg-muted text-muted-foreground"
//                     )}>
//                       <CheckSquare className="w-3 h-3" />
//                       <span>{completedSubtasks}/{totalSubtasks}</span>
//                     </div>
//                   )}
//                   {/* Attachment indicator */}
//                   {task.attachments.length > 0 && (
//                     <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
//                       <Paperclip className="w-3 h-3" />
//                       {task.attachments.length}
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Progress Bar on Card Face if there are subtasks */}
//               {totalSubtasks > 0 && !showDetails && (
//                  <div className="h-1 w-full bg-muted rounded-full overflow-hidden mt-1">
//                     <div 
//                       className="h-full bg-primary/80 transition-all duration-500" 
//                       style={{ width: `${progress}%` }}
//                     />
//                  </div>
//               )}

//               {/* Expanded Details Area */}
//               {showDetails && (
//                 <div className="pt-3 mt-3 border-t border-dashed border-border/60 space-y-4 animate-in slide-in-from-top-1 duration-200">
                  
//                   {/* Description Full */}
//                   {task.description && (
//                     <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded-md">
//                       {task.description}
//                     </div>
//                   )}

//                   {/* Subtasks */}
//                   <div className="space-y-2">
//                     <div className="flex items-center justify-between">
//                       <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Subtasks</label>
//                       <span className="text-[10px] text-muted-foreground">{Math.round(progress)}%</span>
//                     </div>
//                     <Progress value={progress} className="h-1.5" />
                    
//                     <div className="space-y-1.5 mt-2">
//                       {task.subtasks.map(st => (
//                         <div key={st.id} className="flex items-center gap-2 group/item">
//                           <button 
//                             onClick={() => onToggleSubtask(task._id, st.id)}
//                             className={cn(
//                               "flex-shrink-0 h-4 w-4 rounded border flex items-center justify-center transition-all",
//                               st.completed 
//                                 ? "bg-primary border-primary text-primary-foreground" 
//                                 : "border-muted-foreground/40 hover:border-primary"
//                             )}
//                           >
//                             {st.completed && <CheckCircle className="w-3 h-3" />}
//                           </button>
//                           <span className={cn(
//                             "text-xs leading-tight transition-all flex-1", 
//                             st.completed ? "text-muted-foreground line-through decoration-border" : "text-foreground"
//                           )}>
//                             {st.title}
//                           </span>
//                           <button 
//                             onClick={() => onDeleteSubtask(task._id, st.id)}
//                             className="opacity-0 group-hover/item:opacity-100 p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-all"
//                           >
//                             <X className="w-3 h-3" />
//                           </button>
//                         </div>
//                       ))}
//                     </div>
//                     <div className="relative">
//                       <Input 
//                         value={newSubtask}
//                         onChange={(e) => setNewSubtask(e.target.value)}
//                         onKeyDown={(e) => {
//                           if (e.key === 'Enter') {
//                             e.preventDefault();
//                             onAddSubtask(task._id, newSubtask);
//                             setNewSubtask('');
//                           }
//                         }}
//                         placeholder="Add a subtask..."
//                         className="h-8 text-xs bg-transparent border-transparent hover:bg-muted/50 focus:bg-background focus:border-input px-2 transition-all placeholder:text-muted-foreground/50"
//                       />
//                       <div className="absolute right-1 top-1.5 text-[10px] text-muted-foreground opacity-50 pointer-events-none">
//                         ↵
//                       </div>
//                     </div>
//                   </div>

//                   {/* Attachments */}
//                   <div className="space-y-2">
//                     <div className="flex items-center justify-between">
//                       <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Attachments</label>
//                       <div className="relative">
//                          <input 
//                             type="file" 
//                             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//                             onChange={handleFileChange}
//                             id={`file-${task._id}`}
//                           />
//                           <Button variant="ghost" size="sm" className="h-5 w-5 p-0 hover:bg-muted rounded-full">
//                             <Plus className="w-3 h-3" />
//                           </Button>
//                       </div>
//                     </div>
                    
//                     {task.attachments.length === 0 ? (
//                       <div className="text-[10px] text-muted-foreground/50 italic px-2">No files attached</div>
//                     ) : (
//                       <div className="grid grid-cols-1 gap-1">
//                         {task.attachments.map(att => (
//                           <a 
//                             key={att.id} 
//                             href={att.url} 
//                             target="_blank" 
//                             rel="noreferrer"
//                             className="flex items-center gap-2 text-xs p-1.5 rounded-md bg-muted/50 hover:bg-muted transition-colors group/file"
//                           >
//                             <div className="bg-background p-1 rounded shadow-sm">
//                               <Paperclip className="w-3 h-3 text-primary" />
//                             </div>
//                             <span className="truncate flex-1 font-medium">{att.name}</span>
//                             <ArrowRight className="w-3 h-3 opacity-0 group-hover/file:opacity-50 -ml-1" />
//                           </a>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}

//             </CardContent>
//           </Card>
//         </div>
//       )}
//     </Draggable>
//   );
// }

// function EditTaskDialog({ 
//   task, 
//   open, 
//   onOpenChange, 
//   onSave,
//   onAddSubtask,
//   onToggleSubtask,
//   onDeleteSubtask
// }: { 
//   task: Task; 
//   open: boolean; 
//   onOpenChange: (open: boolean) => void;
//   onSave: (data: TaskFormData) => void;
//   onAddSubtask: (id: string, title: string) => void;
//   onToggleSubtask: (id: string, sid: string) => void;
//   onDeleteSubtask: (id: string, sid: string) => void;
// }) {
//   const [newSubtask, setNewSubtask] = useState('');
//   const form = useForm<TaskFormData>({
//     resolver: zodResolver(taskSchema),
//     defaultValues: {
//       title: task.title,
//       description: task.description,
//       status: task.status,
//       priority: task.priority,
//       dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
//       tags: (task.tags || []).join(', '),
//     },
//   });

//   // Calculate progress for the edit view
//   const completedSubtasks = task.subtasks.filter(s => s.completed).length;
//   const totalSubtasks = task.subtasks.length;
//   const progress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
//         <DialogHeader>
//           <DialogTitle>Edit Task</DialogTitle>
//         </DialogHeader>
        
//         <Form {...form}>
//           <form id="edit-task-form" onSubmit={form.handleSubmit(onSave)} className="flex-1 flex flex-col overflow-hidden">
//             <ScrollArea className="flex-1 pr-4 -mr-4">
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
//                 {/* Main Form Column */}
//                 <div className="md:col-span-2 space-y-6">
//                       <FormField
//                         control={form.control}
//                         name="title"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Title</FormLabel>
//                             <FormControl>
//                               <Input {...field} className="font-medium text-lg" />
//                             </FormControl>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
                      
//                       <FormField
//                         control={form.control}
//                         name="description"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Description</FormLabel>
//                             <FormControl>
//                               <Textarea className="min-h-[120px] resize-none" {...field} />
//                             </FormControl>
//                           </FormItem>
//                         )}
//                       />

//                       <div className="space-y-4 bg-muted/30 p-4 rounded-lg border border-border/50">
//                         <div className="flex items-center justify-between mb-2">
//                           <h4 className="text-sm font-semibold flex items-center gap-2">
//                             <CheckSquare className="w-4 h-4" /> Subtasks
//                           </h4>
//                           <span className="text-xs text-muted-foreground">{completedSubtasks}/{totalSubtasks} completed</span>
//                         </div>
                        
//                         <Progress value={progress} className="h-2 mb-4" />

//                         <div className="space-y-2">
//                           {task.subtasks.map(st => (
//                             <div key={st.id} className="flex items-center gap-3 group/item bg-background p-2 rounded border border-border/50 hover:border-primary/30 transition-all">
//                               <button 
//                                 type="button"
//                                 onClick={() => onToggleSubtask(task._id, st.id)}
//                                 className={cn(
//                                   "flex-shrink-0 h-5 w-5 rounded border flex items-center justify-center transition-all",
//                                   st.completed 
//                                     ? "bg-primary border-primary text-primary-foreground" 
//                                     : "border-muted-foreground/40 hover:border-primary"
//                                 )}
//                               >
//                                 {st.completed && <CheckCircle className="w-3.5 h-3.5" />}
//                               </button>
//                               <span className={cn(
//                                 "text-sm leading-tight transition-all flex-1", 
//                                 st.completed ? "text-muted-foreground line-through decoration-border" : "text-foreground"
//                               )}>
//                                 {st.title}
//                               </span>
//                               <button 
//                                 type="button"
//                                 onClick={() => onDeleteSubtask(task._id, st.id)}
//                                 className="opacity-0 group-hover/item:opacity-100 p-1.5 hover:bg-destructive/10 hover:text-destructive rounded transition-all"
//                               >
//                                 <Trash2 className="w-3.5 h-3.5" />
//                               </button>
//                             </div>
//                           ))}
//                         </div>

//                         <div className="flex gap-2">
//                           <Input 
//                             value={newSubtask}
//                             onChange={(e) => setNewSubtask(e.target.value)}
//                             onKeyDown={(e) => {
//                               if (e.key === 'Enter') {
//                                 e.preventDefault();
//                                 onAddSubtask(task._id, newSubtask);
//                                 setNewSubtask('');
//                               }
//                             }}
//                             placeholder="Add a new subtask..."
//                             className="h-9 text-sm"
//                           />
//                           <Button 
//                             type="button"
//                             size="sm"
//                             onClick={() => {
//                               onAddSubtask(task._id, newSubtask);
//                               setNewSubtask('');
//                             }}
//                           >
//                             Add
//                           </Button>
//                         </div>
//                       </div>
//                 </div>

//                 {/* Sidebar Column */}
//                 <div className="space-y-6 md:border-l md:pl-6">
//                    <div className="space-y-4">
//                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Properties</h4>
                     
//                      <div className="space-y-3">
//                         <FormField
//                           control={form.control}
//                           name="status"
//                           render={({ field }) => (
//                             <FormItem>
//                               <FormLabel className="text-xs">Status</FormLabel>
//                               <Select onValueChange={field.onChange} defaultValue={field.value}>
//                                 <FormControl>
//                                   <SelectTrigger>
//                                     <SelectValue />
//                                   </SelectTrigger>
//                                 </FormControl>
//                                 <SelectContent>
//                                   <SelectItem value="pending">To Do</SelectItem>
//                                   <SelectItem value="in_progress">In Progress</SelectItem>
//                                   <SelectItem value="completed">Done</SelectItem>
//                                 </SelectContent>
//                               </Select>
//                             </FormItem>
//                           )}
//                         />

//                         <FormField
//                           control={form.control}
//                           name="priority"
//                           render={({ field }) => (
//                             <FormItem>
//                               <FormLabel className="text-xs">Priority</FormLabel>
//                               <Select onValueChange={field.onChange} defaultValue={field.value}>
//                                 <FormControl>
//                                   <SelectTrigger>
//                                     <SelectValue />
//                                   </SelectTrigger>
//                                 </FormControl>
//                                 <SelectContent>
//                                   <SelectItem value="low">Low</SelectItem>
//                                   <SelectItem value="medium">Medium</SelectItem>
//                                   <SelectItem value="high">High</SelectItem>
//                                 </SelectContent>
//                               </Select>
//                             </FormItem>
//                           )}
//                         />

//                         <FormField
//                           control={form.control}
//                           name="dueDate"
//                           render={({ field }) => (
//                             <FormItem>
//                               <FormLabel className="text-xs">Due Date</FormLabel>
//                               <FormControl>
//                                 <Input type="date" {...field} />
//                               </FormControl>
//                             </FormItem>
//                           )}
//                         />

//                         <FormField
//                           control={form.control}
//                           name="tags"
//                           render={({ field }) => (
//                             <FormItem>
//                               <FormLabel className="text-xs">Tags</FormLabel>
//                               <FormControl>
//                                 <Input {...field} placeholder="Comma separated" />
//                               </FormControl>
//                             </FormItem>
//                           )}
//                         />
//                      </div>
//                    </div>

//                    <Separator />

//                    <div className="pt-2">
//                      <Button type="submit" className="w-full">Save Changes</Button>
//                    </div>
//                 </div>
//               </div>
//             </ScrollArea>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   );
// }
// export default Posts;



import { useState, useEffect } from 'react';
import {
  Plus, Calendar, Send, Edit, Trash2, Clock, CheckCircle,
  AlertCircle, Flag, CalendarDays, User, Tag, Paperclip,
  GripVertical, X, CheckSquare, Square, MoreHorizontal,
  ChevronDown, ChevronUp, Filter, Search, LayoutGrid, List,
  Briefcase, Layers, ArrowRight, Circle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertTaskSchema, Task as SharedTask, type InsertTask, type Group } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Progress } from "@/components/ui/progress";
import { z } from 'zod';

// We re-use Task definition from shared schema but extend optional fields used by Kanban UI:
type Subtask = { id: string; title: string; completed: boolean };
type Attachment = { id: string; name: string; type?: string; url: string };

type Task = SharedTask & {
  subtasks?: Subtask[];
  attachments?: Attachment[];
  assignee?: string;
};

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
  const [viewMode, setViewMode] = useState<'board' | 'grid'>('board');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Listen for auth changes
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

  // Queries: personal tasks, user groups, team tasks
  const { data: personalTasks = [], isLoading: personalTasksLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks/user/personal', currentUserId],
    queryFn: async () => {
      if (!currentUserId) return [];
      const response = await axios.get(`http://localhost:5055/api/tasks/user/${currentUserId}/personal`, { withCredentials: true });
      return response.data;
    },
    enabled: !!currentUserId,
  });

  const { data: userGroups = [] } = useQuery<Group[]>({
    queryKey: ['/api/groups/user', currentUserId],
    queryFn: async () => {
      if (!currentUserId) return [];
      const response = await axios.get(`http://localhost:5055/api/groups/user/${currentUserId}`, { withCredentials: true });
      return response.data;
    },
    enabled: !!currentUserId,
  });

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
// Add right after your queries (so they can be reused in the mutation)
const personalKey = ['/api/tasks/user/personal', currentUserId];
const teamKey = ['/api/tasks/user/team', currentUserId, selectedTeam];

  // Create mutation (keeps your implementation)
  const createTaskMutation = useMutation({
    mutationFn: async (data: Omit<InsertTask, 'userId'>) => {
      const taskData = { ...data, userId: currentUserId };
      const response = await axios.post('http://localhost:5055/api/tasks', taskData, { withCredentials: true });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/user/personal', currentUserId] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/user/team', currentUserId] });
      setIsCreateOpen(false);
      toast({ title: "Success", description: "Task created successfully!" });
    },
    onError: (error) => {
      console.error('Task creation error:', error);
      toast({ title: "Error", description: "Failed to create task. Please try again.", variant: "destructive" });
    },
  });

  // Edit mutation - used for status changes, subtasks, attachments, full edits
 // REPLACE your existing editTaskMutation with this optimistic version
const editTaskMutation = useMutation({
  mutationFn: async ({ id, data }: { id: string; data: Partial<Task> }) => {
    const response = await axios.patch(`http://localhost:5055/api/tasks/${id}`, data, { withCredentials: true });
    return response.data;
  },

  // optimistic update
  onMutate: async ({ id, data }: { id: string; data: Partial<Task> }) => {
    await queryClient.cancelQueries({ queryKey: personalKey });
    await queryClient.cancelQueries({ queryKey: teamKey });

    const previousPersonal = queryClient.getQueryData<Task[]>(personalKey);
    const previousTeam = queryClient.getQueryData<Task[]>(teamKey);

    const applyUpdate = (tasks?: Task[]) => {
      if (!tasks) return tasks;
      return tasks.map(t => (t._id === id ? { ...t, ...data } : t));
    };

    queryClient.setQueryData<Task[]>(personalKey, old => applyUpdate(old));
    queryClient.setQueryData<Task[]>(teamKey, old => applyUpdate(old));

    // if the edit dialog is open for this task, update local editingTask to reflect optimistic change
    if (editingTask && editingTask._id === id) {
      setEditingTask(prev => prev ? ({ ...prev, ...data } as Task) : prev);
    }

    return { previousPersonal, previousTeam };
  },

  onError: (err, variables, context: any) => {
    // rollback on error
    if (context?.previousPersonal) queryClient.setQueryData(personalKey, context.previousPersonal);
    if (context?.previousTeam) queryClient.setQueryData(teamKey, context.previousTeam);
    toast({
      title: "Error",
      description: "Failed to update task. Changes were reverted.",
      variant: "destructive",
    });
  },

  onSettled: () => {
    // always refetch to sync with server
    queryClient.invalidateQueries({ queryKey: personalKey });
    queryClient.invalidateQueries({ queryKey: teamKey });
    setIsEditOpen(false);
  },

  onSuccess: () => {
    toast({
      title: "Success",
      description: "Task updated successfully!",
    });
  },
});


  // Delete mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.delete(`http://localhost:5055/api/tasks/${id}`, { withCredentials: true });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/user/personal', currentUserId] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/user/team', currentUserId] });
      toast({ title: "Success", description: "Task deleted successfully!" });
    },
    onError: (error) => {
      console.error('Task deletion error:', error);
      toast({ title: "Error", description: "Failed to delete task. Please try again.", variant: "destructive" });
    },
  });

  // Forms
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
    defaultValues: { title: '', description: '', status: 'pending', priority: 'medium', dueDate: '' },
  });

  // Not logged in view
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

  // Handlers
  const onSubmit = (data: Omit<InsertTask, 'userId'>) => createTaskMutation.mutate(data);
  const onEditSubmit = (data: EditTaskFormData) => {
    if (!editingTask) return;
    const payload: Partial<Task> = {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    };
    editTaskMutation.mutate({ id: editingTask._id, data: payload });
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    editForm.reset({
      title: task.title,
      description: task.description || '',
      status: (task.status as any) || 'pending',
      priority: task.priority || 'medium',
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

  const filteredTasks = (currentTasks || []).filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  // Kanban helpers
  const columns = [
    { id: 'pending', title: 'To Do', count: (currentTasks || []).filter(t => t.status === 'pending').length },
    { id: 'in_progress', title: 'In Progress', count: (currentTasks || []).filter(t => t.status === 'in_progress').length },
    { id: 'completed', title: 'Done', count: (currentTasks || []).filter(t => t.status === 'completed').length },
  ];

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;
    const newStatus = destination.droppableId as Task['status'];
    // PATCH status
    editTaskMutation.mutate({ id: draggableId, data: { status: newStatus } });
  };

  const addSubtask = (taskId: string, title: string) => {
    if (!title.trim()) return;
    const task = (currentTasks || []).find(t => t._id === taskId);
    if (!task) return;
    const newSub = { id: Math.random().toString(36).substr(2, 9), title: title.trim(), completed: false };
    const updated = [...(task.subtasks || []), newSub];
    editTaskMutation.mutate({ id: taskId, data: { subtasks: updated } });
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    const task = (currentTasks || []).find(t => t._id === taskId);
    if (!task) return;
    const updated = (task.subtasks || []).map(st => st.id === subtaskId ? { ...st, completed: !st.completed } : st);
    editTaskMutation.mutate({ id: taskId, data: { subtasks: updated } });
  };

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    const task = (currentTasks || []).find(t => t._id === taskId);
    if (!task) return;
    const updated = (task.subtasks || []).filter(st => st.id !== subtaskId);
    editTaskMutation.mutate({ id: taskId, data: { subtasks: updated } });
  };

  const addAttachment = (taskId: string, file: File) => {
    const task = (currentTasks || []).find(t => t._id === taskId);
    if (!task) return;
    const url = URL.createObjectURL(file); // local preview - adjust if uploading to server
    const att = { id: Math.random().toString(36).substr(2, 9), name: file.name, type: file.type, url };
    const updated = [...(task.attachments || []), att];
    editTaskMutation.mutate({ id: taskId, data: { attachments: updated } });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'in_progress':
        return <GripVertical className="w-4 h-4 text-indigo-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'pending': return 'bg-blue-500';
      case 'in_progress': return 'bg-indigo-500';
      default: return 'bg-orange-500';
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen font-sans text-foreground flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-sm text-muted-foreground">Manage your tasks — board & list views with subtasks.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center bg-muted/50 p-1 rounded-md border">
            <Button variant={viewMode === 'board' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('board')} className="h-8 px-3 text-xs font-medium">
              <LayoutGrid className="h-3.5 w-3.5 mr-2" /> Board
            </Button>
            <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('grid')} className="h-8 px-3 text-xs font-medium">
              <List className="h-3.5 w-3.5 mr-2" /> Grid
            </Button>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="h-9 gap-2">
                <Plus size={16} />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>Add a new task to your board.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="status" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="pending">To Do</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Done</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="priority" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="dueDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl><Textarea {...field} /></FormControl>
                    </FormItem>
                  )} />

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={createTaskMutation.isPending}>{createTaskMutation.isPending ? 'Creating...' : 'Create'}</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Controls: task type, teams, filter */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Task Type:</span>
          <div className="flex gap-2">
            {['personal', 'team'].map((type) => (
              <Button key={type} variant={taskType === type ? 'default' : 'outline'} size="sm" onClick={() => { setTaskType(type as any); setSelectedTeam('all'); }}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>

          {taskType === 'team' && userGroups.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Team:</span>
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="w-48"><SelectValue placeholder="Select a team" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  {userGroups.map(g => <SelectItem key={g._id} value={g._id}>{g.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Filter:</span>
          <div className="flex gap-2">
            {['all', 'completed', 'pending'].map(s => (
              <Button key={s} variant={filter === s as any ? 'default' : 'outline'} size="sm" onClick={() => setFilter(s as any)}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Button>
            ))}
          </div>
        </div> */}
      </div>

      {/* Board or Grid view */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="glass-effect shadow-xl animate-pulse">
              <CardHeader><div className="h-4 bg-gray-200 rounded w-3/4"></div></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (viewMode === 'grid') ? (
        // Existing grid/list view (slightly updated to show subtasks count)
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12 col-span-3">
              <Send className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium">No tasks found</h3>
              <p className="text-gray-500">{filter === 'all' ? "Create your first task to get started!" : `No ${filter} tasks found.`}</p>
            </div>
          ) : filteredTasks.map(task => (
            <Card key={task._id} className="glass-effect shadow-xl hover:shadow-2xl transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold truncate">{task.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(task.status)}
                    <Badge className={`${getStatusColor(task.status)} text-white`}>{task.status}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 line-clamp-3">{task.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><Flag className="w-4 h-4" /><Badge variant="secondary" className="text-xs">{task.priority}</Badge></div>
                  {task.dueDate && <div className="flex items-center gap-2 text-sm text-gray-500"><CalendarDays className="w-4 h-4" /><span>Due: {formatDate(task.dueDate)}</span></div>}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Created: {formatDate(task.createdAt || new Date())}</span>
                  <span>{(task.subtasks || []).filter(s => s.completed).length}/{(task.subtasks || []).length} subtasks</span>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(task)} disabled={editTaskMutation.isPending}><Edit size={14} className="mr-1" /> Edit</Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(task._id)} disabled={deleteTaskMutation.isPending}><Trash2 size={14} className="mr-1" /> Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // Kanban Board view
        <div className="flex-1 overflow-auto">
          <ScrollArea className="h-[70vh]">
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="flex gap-6 min-w-[900px]">
                {columns.map(column => (
                  <div key={column.id} className="flex-1 flex flex-col min-w-[300px]">
                    <div className="flex items-center justify-between mb-4 px-1">
                      <div className="flex items-center gap-2">
                        <span className={cn("h-2.5 w-2.5 rounded-full ring-2", column.id === 'pending' ? 'bg-slate-500 ring-slate-200' : column.id === 'in_progress' ? 'bg-indigo-500 ring-indigo-200' : 'bg-green-500 ring-green-200')} />
                        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">{column.title}</h3>
                        <Badge variant="secondary" className="ml-1 px-1.5 min-w-[20px] justify-center h-5 text-[10px]">{column.count}</Badge>
                      </div>
                      {/* <Button variant="ghost" size="icon" className="h-6 w-6"><Plus className="h-4 w-4" /></Button> */}
                    </div>

                    <Droppable droppableId={column.id}>
                      {(provided, snapshot) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className={cn("flex-1 rounded-xl p-1.5 bg-muted/30 border border-dashed", snapshot.isDraggingOver ? "bg-muted/60 border-primary/30" : "")}>
                          <div className="space-y-3">
                            {(currentTasks || []).filter(t => t.status === column.id).map((task, index) => (
                              <TaskCard
                                key={task._id}
                                task={task}
                                index={index}
                                onEdit={() => handleEdit(task)}
                                onDelete={() => handleDelete(task._id)}
                                onAddSubtask={addSubtask}
                                onToggleSubtask={toggleSubtask}
                                onDeleteSubtask={deleteSubtask}
                                onAddAttachment={addAttachment}
                              />
                            ))}
                          </div>
                          {provided.placeholder}
                          <Button variant="ghost" className="w-full justify-start text-muted-foreground mt-2 h-9 text-sm" onClick={() => { form.setValue('status', column.id as any); setIsCreateOpen(true); }}>
                            <Plus className="h-3.5 w-3.5 mr-2" /> Add Task
                          </Button>
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
              </div>
            </DragDropContext>
          </ScrollArea>

          {/* Edit dialog reused for backend patching */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader><DialogTitle>Edit Task</DialogTitle></DialogHeader>
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="flex-1 flex flex-col overflow-hidden">
                  <ScrollArea className="flex-1 pr-4 -mr-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                      <div className="md:col-span-2 space-y-6">
                        <FormField control={editForm.control} name="title" render={({ field }) => (
                          <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} className="font-medium text-lg" /></FormControl><FormMessage /></FormItem>
                        )} />

                        <FormField control={editForm.control} name="description" render={({ field }) => (
                          <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} className="min-h-[120px]" /></FormControl></FormItem>
                        )} />

                        {/* Subtasks block: we fetch from editingTask */}
                        <div className="space-y-4 bg-muted/30 p-4 rounded-lg border border-border/50">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-semibold flex items-center gap-2"><CheckSquare className="w-4 h-4" /> Subtasks</h4>
                            <span className="text-xs text-muted-foreground">{(editingTask?.subtasks || []).filter(s => s.completed).length}/{(editingTask?.subtasks || []).length}</span>
                          </div>

                          <Progress value={(editingTask?.subtasks && editingTask.subtasks.length > 0) ? Math.round(((editingTask.subtasks.filter(s => s.completed).length) / editingTask.subtasks.length) * 100) : 0} className="h-2 mb-4" />

                          <div className="space-y-2">
                            {(editingTask?.subtasks || []).map(st => (
                              <div key={st.id} className="flex items-center gap-3 group/item bg-background p-2 rounded border border-border/50">
                                <button type="button" onClick={() => toggleSubtask(editingTask!._id, st.id)} className={cn("flex-shrink-0 h-5 w-5 rounded border flex items-center justify-center", st.completed ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/40 hover:border-primary")}>
                                  {st.completed && <CheckCircle className="w-3.5 h-3.5" />}
                                </button>
                                <span className={cn("text-sm leading-tight flex-1", st.completed ? "text-muted-foreground line-through" : "text-foreground")}>{st.title}</span>
                                <button type="button" onClick={() => deleteSubtask(editingTask!._id, st.id)} className="opacity-0 group-hover/item:opacity-100 p-1.5 hover:bg-destructive/10 hover:text-destructive rounded transition-all">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>

                          <SubtaskAdder onAdd={(title) => { if (editingTask) addSubtask(editingTask._id, title); }} />
                        </div>
                      </div>

                      <div className="space-y-6 md:border-l md:pl-6">
                        <div className="space-y-4">
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Properties</h4>
                          <div className="space-y-3">
                            <FormField control={editForm.control} name="status" render={({ field }) => (
                              <FormItem><FormLabel className="text-xs">Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="pending">To Do</SelectItem><SelectItem value="in_progress">In Progress</SelectItem><SelectItem value="completed">Done</SelectItem></SelectContent></Select></FormItem>
                            )} />

                            <FormField control={editForm.control} name="priority" render={({ field }) => (
                              <FormItem><FormLabel className="text-xs">Priority</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem></SelectContent></Select></FormItem>
                            )} />

                            <FormField control={editForm.control} name="dueDate" render={({ field }) => (
                              <FormItem><FormLabel className="text-xs">Due Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>
                            )} />
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <Button type="submit" className="w-full" disabled={editTaskMutation.isPending}>{editTaskMutation.isPending ? 'Saving...' : 'Save Changes'}</Button>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
};

/* -------------------------
   Helper components inside file
   (TaskCard + SubtaskAdder)
   ------------------------- */

function TaskCard({
  task,
  index,
  onEdit,
  onDelete,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onAddAttachment,
}: {
  task: Task;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onAddSubtask: (id: string, title: string) => void;
  onToggleSubtask: (id: string, sid: string) => void;
  onDeleteSubtask: (id: string, sid: string) => void;
  onAddAttachment: (id: string, file: File) => void;
}) {
  const [newSubtask, setNewSubtask] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  const completedSubtasks = (task.subtasks || []).filter(s => s.completed).length;
  const totalSubtasks = (task.subtasks || []).length;
  const progress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onAddAttachment(task._id, e.target.files[0]);
    }
  };

  const PriorityBadge = ({ priority }: { priority?: string }) => {
    const config: any = {
      high: { color: 'text-red-600 bg-red-50 border-red-100', icon: AlertCircle },
      medium: { color: 'text-amber-600 bg-amber-50 border-amber-100', icon: Clock },
      low: { color: 'text-blue-600 bg-blue-50 border-blue-100', icon: Flag },
    };
    const { color, icon: Icon } = config[priority || 'medium'];
    return (
      <Badge variant="outline" className={cn("capitalize gap-1 pr-2 h-5 font-medium border", color)}>
        <Icon className="w-3 h-3" /> {priority}
      </Badge>
    );
  };

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} style={provided.draggableProps.style} className={cn("outline-none", snapshot.isDragging && "z-50")}>
          <Card className={cn("group bg-card hover:shadow-md transition-all duration-200 border-border/60 shadow-sm", snapshot.isDragging ? "shadow-xl ring-2 ring-primary/20 rotate-1 scale-105" : "")}>
            <CardContent className="p-3.5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                  <PriorityBadge priority={task.priority} />
                  {(task.tags || []).slice(0, 2).map(tag => (
                    <Badge key={tag} variant="secondary" className="h-5 text-[10px] font-normal bg-muted text-muted-foreground border-transparent">{tag}</Badge>
                  ))}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 -mr-1 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onEdit}>Edit Task</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={onDelete}>Delete Task</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div>
                <h4 className="font-semibold text-sm leading-snug hover:text-primary cursor-pointer transition-colors" onClick={() => setShowDetails(!showDetails)}>{task.title}</h4>
                {task.description && !showDetails && <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">{task.description}</p>}
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-3">
                  <Avatar className="h-5 w-5 border border-background"><AvatarFallback className="text-[9px] bg-primary/10 text-primary">{task.assignee ? task.assignee.substring(0,2).toUpperCase() : 'UN'}</AvatarFallback></Avatar>
                  {task.dueDate && <div className={cn("flex items-center gap-1 text-[10px] font-medium", new Date(task.dueDate) < new Date() ? "text-red-500" : "text-muted-foreground")}><Calendar className="w-3 h-3" />{format(new Date(task.dueDate), 'MMM d')}</div>}
                </div>

                <div className="flex items-center gap-2">
                  {(totalSubtasks > 0 || showDetails) && <div className={cn("flex items-center gap-1.5 text-[10px] px-1.5 py-0.5 rounded-md", progress === 100 ? "bg-green-50 text-green-600" : "bg-muted text-muted-foreground")}><CheckSquare className="w-3 h-3" /> <span>{completedSubtasks}/{totalSubtasks}</span></div>}
                  {task.attachments && task.attachments.length > 0 && <div className="flex items-center gap-1 text-[10px] text-muted-foreground"><Paperclip className="w-3 h-3" />{task.attachments.length}</div>}
                </div>
              </div>

              {totalSubtasks > 0 && !showDetails && <div className="h-1 w-full bg-muted rounded-full overflow-hidden mt-1"><div className="h-full bg-primary/80 transition-all" style={{ width: `${progress}%` }} /></div>}

              {showDetails && (
                <div className="pt-3 mt-3 border-t border-dashed border-border/60 space-y-4">
                  {task.description && <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded-md">{task.description}</div>}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Subtasks</label>
                      <span className="text-[10px] text-muted-foreground">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                    <div className="space-y-1.5 mt-2">
                      {(task.subtasks || []).map(st => (
                        <div key={st.id} className="flex items-center gap-2 group/item">
                          <button onClick={() => onToggleSubtask(task._id, st.id)} className={cn("flex-shrink-0 h-4 w-4 rounded border flex items-center justify-center transition-all", st.completed ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/40 hover:border-primary")}>
                            {st.completed && <CheckCircle className="w-3 h-3" />}
                          </button>
                          <span className={cn("text-xs leading-tight flex-1", st.completed ? "text-muted-foreground line-through" : "text-foreground")}>{st.title}</span>
                          <button onClick={() => onDeleteSubtask(task._id, st.id)} className="opacity-0 group-hover/item:opacity-100 p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-all"><X className="w-3 h-3" /></button>
                        </div>
                      ))}
                    </div>

                    <div className="relative">
                      <Input value={newSubtask} onChange={(e) => setNewSubtask(e.target.value)} onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); onAddSubtask(task._id, newSubtask); setNewSubtask(''); }
                      }} placeholder="Add a subtask..." className="h-8 text-xs bg-transparent border-transparent hover:bg-muted/50 focus:bg-background px-2" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Attachments</label>
                      <div className="relative">
                        <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} />
                        <Button variant="ghost" size="sm" className="h-5 w-5 p-0 hover:bg-muted rounded-full"><Plus className="w-3 h-3" /></Button>
                      </div>
                    </div>

                    {(!task.attachments || task.attachments.length === 0) ? (
                      <div className="text-[10px] text-muted-foreground/50 italic px-2">No files attached</div>
                    ) : (
                      <div className="grid grid-cols-1 gap-1">
                        {task.attachments!.map(att => (
                          <a key={att.id} href={att.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs p-1.5 rounded-md bg-muted/50 hover:bg-muted transition-colors group/file">
                            <div className="bg-background p-1 rounded shadow-sm"><Paperclip className="w-3 h-3 text-primary" /></div>
                            <span className="truncate flex-1 font-medium">{att.name}</span>
                            <ArrowRight className="w-3 h-3 opacity-0 group-hover/file:opacity-50 -ml-1" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
}

/* Simple small subtask adder component used inside edit dialog */
function SubtaskAdder({ onAdd }: { onAdd: (title: string) => void }) {
  const [val, setVal] = useState('');
  return (
    <div className="flex gap-2">
      <Input value={val} onChange={(e) => setVal(e.target.value)} placeholder="Add a new subtask..." className="h-9 text-sm" onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (val.trim()) { onAdd(val.trim()); setVal(''); }
        }
      }} />
      <Button type="button" size="sm" onClick={() => { if (val.trim()) { onAdd(val.trim()); setVal(''); } }}>Add</Button>
    </div>
  );
}

export default Posts;
