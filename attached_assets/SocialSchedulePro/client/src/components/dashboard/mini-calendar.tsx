import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

export default function MiniCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

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
        date: prevDate.getDate(),
        isCurrentMonth: false,
        isToday: false,
        hasPost: false
      });
    }
    
    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === new Date().toDateString();
      const hasPost = [3, 13, 15, 18].includes(day); // Mock data for posts
      
      days.push({
        date: day,
        isCurrentMonth: true,
        isToday,
        hasPost
      });
    }
    
    // Add next month's days to fill the grid
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: day,
        isCurrentMonth: false,
        isToday: false,
        hasPost: false
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
    <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Content Calendar</h3>
          <Button variant="link" className="text-sm text-primary hover:text-primary/80">
            View full
          </Button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="text-gray-400 hover:text-gray-600"
            >
              <ChevronLeft size={16} />
            </Button>
            <h4 className="font-medium text-gray-900">{monthName}</h4>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigateMonth('next')}
              className="text-gray-400 hover:text-gray-600"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <div key={`day-header-${index}`} className="text-xs font-medium text-gray-500 p-2">
                {day}
              </div>
            ))}
            
            {days.map((day, index) => (
              <div 
                key={index}
                className={`text-sm p-2 relative cursor-pointer hover:bg-gray-100 rounded ${
                  day.isToday 
                    ? 'bg-primary text-white rounded-lg' 
                    : day.isCurrentMonth 
                      ? 'text-gray-900' 
                      : 'text-gray-400'
                }`}
              >
                {day.date}
                {day.hasPost && (
                  <div className={`w-1 h-1 rounded-full absolute bottom-1 left-1/2 transform -translate-x-1/2 ${
                    day.isToday ? 'bg-white' : 'bg-primary'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
