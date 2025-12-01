import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserAvatarProps {
  name: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showRing?: boolean;
}

const sizeClasses = {
  sm: 'w-9 h-9',
  md: 'w-11 h-11',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
};

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-lg',
  xl: 'text-2xl',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getGradientFromName(name: string): string {
  const gradients = [
    'from-violet-500 via-purple-500 to-fuchsia-500',
    'from-blue-500 via-cyan-500 to-teal-500',
    'from-rose-500 via-pink-500 to-fuchsia-500',
    'from-amber-500 via-orange-500 to-red-500',
    'from-emerald-500 via-green-500 to-teal-500',
    'from-indigo-500 via-purple-500 to-pink-500',
    'from-cyan-500 via-blue-500 to-indigo-500',
    'from-fuchsia-500 via-pink-500 to-rose-500',
  ];
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradients.length;
  return gradients[index];
}

export default function UserAvatar({ name, imageUrl, size = 'md', className = '', showRing = false }: UserAvatarProps) {
  const initials = getInitials(name);
  const gradient = getGradientFromName(name);

  return (
    <Avatar 
      className={`
        ${sizeClasses[size]} 
        ${showRing ? 'ring-2 ring-primary/20 ring-offset-2 ring-offset-background' : ''} 
        ${className}
      `} 
      data-testid="avatar-user"
    >
      {imageUrl && <AvatarImage src={imageUrl} alt={name} />}
      <AvatarFallback 
        className={`bg-gradient-to-br ${gradient} text-white font-bold ${textSizeClasses[size]} tracking-wide`}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
