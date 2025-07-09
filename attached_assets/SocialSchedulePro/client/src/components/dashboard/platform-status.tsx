import { Card, CardContent } from "@/components/ui/card";

export default function PlatformStatus() {
  const platforms = [
    {
      name: "Twitter",
      icon: "fab fa-twitter",
      color: "bg-blue-500",
      status: "connected",
      statusColor: "bg-success"
    },
    {
      name: "Facebook",
      icon: "fab fa-facebook",
      color: "bg-blue-600",
      status: "connected",
      statusColor: "bg-success"
    },
    {
      name: "Instagram",
      icon: "fab fa-instagram",
      color: "bg-gradient-to-br from-purple-500 to-pink-500",
      status: "connected",
      statusColor: "bg-success"
    },
    {
      name: "LinkedIn",
      icon: "fab fa-linkedin",
      color: "bg-blue-700",
      status: "reconnect",
      statusColor: "bg-warning"
    }
  ];

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Status</h3>
        <div className="space-y-3">
          {platforms.map((platform) => (
            <div key={platform.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`platform-icon ${platform.color}`}>
                  <i className={platform.icon}></i>
                </div>
                <span className="font-medium text-gray-900">{platform.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 ${platform.statusColor} rounded-full`}></div>
                <span className="text-sm text-gray-600">
                  {platform.status === 'connected' ? 'Connected' : 'Reconnect'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
