import { useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Post } from "@shared/schema";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: posts } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add previous month's days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate,
        dayNumber: prevDate.getDate(),
        isCurrentMonth: false,
        isToday: false,
        posts: []
      });
    }
    
    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === new Date().toDateString();
      const dayPosts = posts?.filter(post => {
        if (!post.scheduledDate) return false;
        const postDate = new Date(post.scheduledDate);
        return postDate.toDateString() === date.toDateString();
      }) || [];
      
      days.push({
        date,
        dayNumber: day,
        isCurrentMonth: true,
        isToday,
        posts: dayPosts
      });
    }
    
    // Add next month's days to fill the grid
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({
        date: nextDate,
        dayNumber: day,
        isCurrentMonth: false,
        isToday: false,
        posts: []
      });
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <>
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Content Calendar</h2>
            <p className="text-gray-600">Schedule and manage your social media posts</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Schedule Post
          </Button>
        </div>
      </div>

      {/* Calendar */}
      <div className="p-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Calendar */}
          <div className="xl:col-span-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">{monthName}</h3>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth('prev')}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentDate(new Date())}
                    >
                      Today
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth('next')}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {/* Day headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
                      {day}
                    </div>
                  ))}

                  {/* Calendar days */}
                  {days.map((day, index) => (
                    <div
                      key={index}
                      className={`min-h-[100px] p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 ${
                        day.isToday ? 'bg-blue-50 border-blue-200' : ''
                      } ${!day.isCurrentMonth ? 'bg-gray-50' : ''}`}
                      onClick={() => setSelectedDate(day.date)}
                    >
                      <div className={`text-sm font-medium mb-1 ${
                        day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                      } ${day.isToday ? 'text-blue-600' : ''}`}>
                        {day.dayNumber}
                      </div>
                      
                      <div className="space-y-1">
                        {day.posts.slice(0, 3).map((post, postIndex) => (
                          <div
                            key={postIndex}
                            className={`text-xs p-1 rounded truncate ${
                              post.status === 'scheduled' ? 'bg-warning/20 text-warning' :
                              post.status === 'published' ? 'bg-success/20 text-success' :
                              'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {post.title}
                          </div>
                        ))}
                        {day.posts.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{day.posts.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Date Posts */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {selectedDate ? selectedDate.toLocaleDateString() : 'Select a date'}
                </h3>
                
                {selectedDate ? (
                  <div className="space-y-3">
                    {posts?.filter(post => {
                      if (!post.scheduledDate) return false;
                      const postDate = new Date(post.scheduledDate);
                      return postDate.toDateString() === selectedDate.toDateString();
                    }).map((post) => (
                      <div key={post.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{post.title}</h4>
                          <span className={`status-badge status-${post.status}`}>
                            {post.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{post.content}</p>
                        <div className="flex items-center space-x-2">
                          {post.platforms.map((platform) => (
                            <span key={platform} className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {platform}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    {posts?.filter(post => {
                      if (!post.scheduledDate) return false;
                      const postDate = new Date(post.scheduledDate);
                      return postDate.toDateString() === selectedDate.toDateString();
                    }).length === 0 && (
                      <p className="text-gray-500 text-sm text-center py-4">
                        No posts scheduled for this date
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm text-center py-4">
                    Click on a date to see scheduled posts
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Calendar Legend */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Legend</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-warning/20 rounded"></div>
                    <span className="text-sm text-gray-600">Scheduled</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-success/20 rounded"></div>
                    <span className="text-sm text-gray-600">Published</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-200 rounded"></div>
                    <span className="text-sm text-gray-600">Draft</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
