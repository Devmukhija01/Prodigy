import React from "react";
import { Phone, PhoneOff, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

interface IncomingCallModalProps {
  caller: {
    from: string;
    sdp: any;
    callType: "audio" | "video";
    callerName?: string;
    callerAvatar?: string;
  };
  onAccept: () => void;
  onReject: () => void;
}

export default function IncomingCallModal({
  caller,
  onAccept,
  onReject
}: IncomingCallModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 w-[90%] max-w-sm shadow-xl text-center animate-in fade-in slide-in-from-bottom-4">
        
        <div className="flex justify-center mb-3">
          {caller.callType === "video" 
            ? <Video className="h-10 w-10 text-primary" />
            : <Phone className="h-10 w-10 text-primary" />}
        </div>

        <h2 className="text-xl font-bold text-foreground">
          Incoming {caller.callType === "video" ? "Video" : "Audio"} Call
        </h2>

        <p className="text-muted-foreground mt-1">
          {caller.callerName ?? "Someone is calling you..."}
        </p>

        <div className="flex items-center justify-center gap-4 mt-6">
          <Button
            className="bg-red-500 hover:bg-red-600 text-white rounded-full h-14 w-14"
            onClick={onReject}
          >
            <PhoneOff className="h-6 w-6 rotate-45" />
          </Button>

          <Button
            className="bg-green-500 hover:bg-green-600 text-white rounded-full h-14 w-14"
            onClick={onAccept}
          >
            {caller.callType === "video" ? (
              <Video className="h-6 w-6" />
            ) : (
              <Phone className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
