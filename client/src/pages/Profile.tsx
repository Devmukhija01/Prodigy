import { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit, Camera, Save, X, ArrowLeft, Upload, Move } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import axios from 'axios';

interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  joinDate: string;
  plan: string;
  avatar?: string;
  verified: boolean;
  socialAccounts: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
}

export default function Profile() {
  const [location, setLocation] = useLocation();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [imagePosition, setImagePosition] = useState({ y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Fetch user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // First try to get user data from localStorage
        const storedUserData = localStorage.getItem("userData");
        if (storedUserData) {
          try {
            const parsedUserData = JSON.parse(storedUserData);
            const transformedUser: UserProfile = {
              id: parsedUserData._id || 1,
              firstName: parsedUserData.firstName || '',
              lastName: parsedUserData.lastName || '',
              email: parsedUserData.email || '',
              phone: parsedUserData.phone || '',
              bio: parsedUserData.bio || '',
              joinDate: parsedUserData.createdAt || new Date().toISOString(),
              plan: parsedUserData.plan || 'Pro Plan',
              avatar: parsedUserData.avatar,
              verified: parsedUserData.verified || false,
              socialAccounts: {
                facebook: parsedUserData.socialAccounts?.facebook || '',
                twitter: parsedUserData.socialAccounts?.twitter || '',
                instagram: parsedUserData.socialAccounts?.instagram || '',
                linkedin: parsedUserData.socialAccounts?.linkedin || ''
              }
            };
            setUser(transformedUser);
            setEditedUser(transformedUser);
          } catch (error) {
            console.error("Error parsing stored user data:", error);
          }
        }
        
        // Then fetch fresh data from server
        const response = await axios.get('https://prodigy-59mg.onrender.com/api/user/me', {
          withCredentials: true
        });
        
        // Transform the API response to match our UserProfile interface
        const userData = response.data;
        const transformedUser: UserProfile = {
          id: userData._id || 1,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          bio: userData.bio || '',
          joinDate: userData.createdAt || new Date().toISOString(),
          plan: userData.plan || 'Pro Plan',
          avatar: userData.avatar,
          verified: userData.verified || false,
          socialAccounts: {
            facebook: userData.socialAccounts?.facebook || '',
            twitter: userData.socialAccounts?.twitter || '',
            instagram: userData.socialAccounts?.instagram || '',
            linkedin: userData.socialAccounts?.linkedin || ''
          }
        };
        
        setUser(transformedUser);
        setEditedUser(transformedUser);
      } catch (err) {
        console.error('Error fetching user data:', err);
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleEdit = () => {
    if (user) {
      setIsEditing(true);
      setEditedUser(user);
    }
  };

  const handleSave = async () => {
    if (!editedUser) return;
    
    try {
      setSavingProfile(true);
      
      // Update user data on the backend
      const response = await axios.put('https://prodigy-59mg.onrender.com/api/user/me', {
        firstName: editedUser.firstName,
        lastName: editedUser.lastName,
        email: editedUser.email,
        phone: editedUser.phone,
        bio: editedUser.bio,
        socialAccounts: editedUser.socialAccounts
      }, {
        withCredentials: true
      });
      
      // Update user state with the response data from server
      const updatedUserData = response.data;
      setUser(updatedUserData);
      setIsEditing(false);
      
      // Update localStorage with new user data
      localStorage.setItem("userData", JSON.stringify(updatedUserData));
      
      // Show success message
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (err: any) {
      console.error('Error updating user data:', err);
      if (err.response?.data?.message) {
        toast({
          title: "Error",
          description: err.response.data.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update user data",
          variant: "destructive",
        });
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setIsEditing(false);
      setEditedUser(user);
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    if (editedUser) {
      setEditedUser(prev => prev ? ({
        ...prev,
        [field]: value
      }) : null);
    }
  };

  const handleSocialChange = (platform: string, value: string) => {
    if (editedUser) {
      setEditedUser(prev => prev ? ({
        ...prev,
        socialAccounts: {
          ...prev.socialAccounts,
          [platform]: value
        }
      }) : null);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select a valid image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size should be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploadingPhoto(true);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('avatar', file);

      // Upload photo to backend
      const response = await axios.post('https://prodigy-59mg.onrender.com/api/user/upload-avatar', formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update user state with new avatar URL (prepend backend URL)
      const newAvatarUrl = response.data.avatarUrl;
      
      if (user) {
        const updatedUser = { ...user, avatar: newAvatarUrl };
        setUser(updatedUser);
        if (editedUser) {
          setEditedUser({ ...editedUser, avatar: newAvatarUrl });
        }
        
        // Update localStorage with new user data
        localStorage.setItem("userData", JSON.stringify(updatedUser));
      }

      // Trigger a global event to update avatar everywhere
      window.dispatchEvent(new CustomEvent('avatarUpdated', { 
        detail: { avatarUrl: newAvatarUrl } 
      }));

      // Show success message
      toast({
        title: "Success",
        description: "Avatar uploaded successfully!",
      });

    } catch (err) {
      console.error('Error uploading photo:', err);
      toast({
        title: "Error",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarClick = () => {
    if (user?.avatar) {
      setCropImage(user.avatar);
      setShowCropModal(true);
    } else {
      triggerFileInput();
    }
  };

  const handleCropSave = async () => {
    if (!cropImage) return;

    try {
      setUploadingPhoto(true);
      
      // Send crop request to server
      const response = await axios.post('https://prodigy-59mg.onrender.com/api/user/crop-avatar', {
        imageUrl: cropImage,
        cropY: imagePosition.y
      }, {
        withCredentials: true
      });

      // Update user state with new avatar URL
      const newAvatarUrl = response.data.avatarUrl;
      
      if (user) {
        const updatedUser = { ...user, avatar: newAvatarUrl };
        setUser(updatedUser);
        if (editedUser) {
          setEditedUser({ ...editedUser, avatar: newAvatarUrl });
        }
        
        // Update localStorage with new user data
        localStorage.setItem("userData", JSON.stringify(updatedUser));
      }

      // Trigger a global event to update avatar everywhere
      window.dispatchEvent(new CustomEvent('avatarUpdated', { 
        detail: { avatarUrl: newAvatarUrl } 
      }));

      // Show success message
      toast({
        title: "Success",
        description: "Avatar adjusted successfully!",
      });

      setShowCropModal(false);
      setCropImage(null);
      setImagePosition({ y: 0 });
      
    } catch (err: any) {
      console.error('Error cropping image:', err);
      if (err.response?.data?.message) {
        toast({
          title: "Error",
          description: err.response.data.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to adjust image. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ y: e.clientY - imagePosition.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const newY = e.clientY - dragStart.y;
    const maxY = 0;
    const minY = -200; // Adjust based on your image height
    
    setImagePosition({
      y: Math.max(minY, Math.min(maxY, newY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">Failed to load profile</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        {/* <div className="flex items-center space-x-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/')}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </Button>
        </div> */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Profile</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your account information and preferences
        </p>
      </div>



      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Summary Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="relative mb-4">
                  <div 
                    className="cursor-pointer hover:opacity-80 transition-opacity duration-200"
                    onClick={handleAvatarClick}
                    title="Click to adjust profile picture"
                  >
                    {user.avatar ? (
                      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg">
                        <img 
                          src={user.avatar} 
                          alt={`${user.firstName} ${user.lastName}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to default avatar if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="w-full h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center hidden">
                          <User className="text-white" size={40} />
                        </div>
                      </div>
                    ) : (
                      <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <User className="text-white" size={40} />
                      </div>
                    )}
                  </div>
                  
                  {/* Upload Button */}
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-blue-500 hover:bg-blue-600 shadow-lg"
                    onClick={triggerFileInput}
                    disabled={uploadingPhoto}
                    title="Upload new photo"
                  >
                    {uploadingPhoto ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Camera size={14} />
                    )}
                  </Button>
                  
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>

                {/* User Info */}
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                  {user.email}
                </p>
                <div className="flex items-center space-x-2 mb-4">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {user.plan}
                  </Badge>
                  {/* {user.verified && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Verified
                    </Badge>
                  )} */}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm text-center">
                  {user.bio}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Account Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Member since</span>
                <span className="font-medium">
                  {new Date(user.joinDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long'
                  })}
                </span>
              </div>
              {/* <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Posts created</span>
                <span className="font-medium">127</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Templates used</span>
                <span className="font-medium">45</span>
              </div> */}
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Profile Information</CardTitle>
              {!isEditing ? (
                <Button onClick={handleEdit} variant="outline" size="sm">
                  <Edit size={16} className="mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button onClick={handleSave} size="sm" disabled={savingProfile}>
                    {savingProfile ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} className="mr-2" />
                        Save
                      </>
                    )}
                  </Button>
                  <Button onClick={handleCancel} variant="outline" size="sm" disabled={savingProfile}>
                    <X size={16} className="mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    {isEditing ? (
                      <Input
                        id="firstName"
                        value={editedUser?.firstName || ''}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <div className="flex items-center mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                        <User size={16} className="text-gray-400 mr-2" />
                        <span className="text-gray-900 dark:text-white">{user.firstName}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    {isEditing ? (
                      <Input
                        id="lastName"
                        value={editedUser?.lastName || ''}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <div className="flex items-center mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                        <User size={16} className="text-gray-400 mr-2" />
                        <span className="text-gray-900 dark:text-white">{user.lastName}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={editedUser?.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <div className="flex items-center mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                        <Mail size={16} className="text-gray-400 mr-2" />
                        <span className="text-gray-900 dark:text-white">{user.email}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={editedUser?.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <div className="flex items-center mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                        <Phone size={16} className="text-gray-400 mr-2" />
                        <span className="text-gray-900 dark:text-white">{user.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="bio">Bio</Label>
                  {isEditing ? (
                    <textarea
                      id="bio"
                      value={editedUser?.bio || ''}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      className="mt-1 w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      rows={3}
                    />
                  ) : (
                    <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <span className="text-gray-900 dark:text-white">{user.bio}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Social Media Accounts */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Connected Accounts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="facebook">Facebook</Label>
                    {isEditing ? (
                      <Input
                        id="facebook"
                        value={editedUser?.socialAccounts.facebook || ''}
                        onChange={(e) => handleSocialChange('facebook', e.target.value)}
                        placeholder="@username"
                        className="mt-1"
                      />
                    ) : (
                      <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                        <span className="text-gray-900 dark:text-white">
                          {user.socialAccounts.facebook || 'Not connected'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="twitter">Twitter</Label>
                    {isEditing ? (
                      <Input
                        id="twitter"
                        value={editedUser?.socialAccounts.twitter || ''}
                        onChange={(e) => handleSocialChange('twitter', e.target.value)}
                        placeholder="@username"
                        className="mt-1"
                      />
                    ) : (
                      <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                        <span className="text-gray-900 dark:text-white">
                          {user.socialAccounts.twitter || 'Not connected'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="instagram">Instagram</Label>
                    {isEditing ? (
                      <Input
                        id="instagram"
                        value={editedUser?.socialAccounts.instagram || ''}
                        onChange={(e) => handleSocialChange('instagram', e.target.value)}
                        placeholder="@username"
                        className="mt-1"
                      />
                    ) : (
                      <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                        <span className="text-gray-900 dark:text-white">
                          {user.socialAccounts.instagram || 'Not connected'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    {isEditing ? (
                      <Input
                        id="linkedin"
                        value={editedUser?.socialAccounts.linkedin || ''}
                        onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                        placeholder="username"
                        className="mt-1"
                      />
                    ) : (
                      <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                        <span className="text-gray-900 dark:text-white">
                          {user.socialAccounts.linkedin || 'Not connected'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Image Crop Modal */}
      <Dialog open={showCropModal} onOpenChange={setShowCropModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Move size={20} />
              Adjust Profile Picture
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Drag the image up or down to adjust which part is visible in your profile picture. Click "Save Changes" to apply the adjustment.
            </p>
            
            <div 
              ref={cropContainerRef}
              className="relative w-48 h-48 mx-auto overflow-hidden rounded-full border-4 border-white dark:border-gray-700 shadow-lg"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {cropImage && (
                <img
                  src={cropImage}
                  alt="Crop preview"
                  className="w-full h-auto cursor-move"
                  style={{
                    transform: `translateY(${imagePosition.y}px)`,
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                  }}
                  draggable={false}
                />
              )}
              
              {/* Crop overlay */}
              <div className="absolute inset-0 border-2 border-white dark:border-gray-300 rounded-full pointer-events-none">
                <div className="absolute inset-0 bg-black bg-opacity-20 rounded-full"></div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCropModal(false);
                  setCropImage(null);
                  setImagePosition({ y: 0 });
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCropSave}
                disabled={uploadingPhoto}
              >
                {uploadingPhoto ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}