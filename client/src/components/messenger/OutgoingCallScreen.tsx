import React, { useEffect, useRef } from "react";
import { PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OutgoingCallScreenProps {
  callType: "audio" | "video";
  onCancel: () => void;
  calleeName?: string;
}

export default function OutgoingCallScreen({
  callType,
  onCancel,
  calleeName
}: OutgoingCallScreenProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = React.useState<MediaStream | null>(null);

  useEffect(() => {
    (async () => {
      const s = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === "video"
      });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    })();

    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);
  const stopPreviewStream = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }
  };
  
  return (
    <div className="fixed inset-0 bg-[#1c1c1c] flex flex-col items-center justify-center text-white z-[9999]">

      <div className="text-xl mb-4">
        Calling {calleeName ?? "…"}
      </div>

      {callType === "video" ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-[320px] h-[240px] object-cover rounded-xl border border-white/20 shadow-xl"
        />
      ) : (
        <div className="w-[320px] h-[240px] bg-black flex items-center justify-center rounded-xl border border-white/20">
          Audio Call
        </div>
      )}

      <Button
        className="mt-8 bg-red-600 hover:bg-red-700 text-white rounded-full h-16 w-16"
        onClick={() => {
          stopPreviewStream();
          onCancel();
        }}
      >
        <PhoneOff className="h-7 w-7 rotate-45" />
      </Button>
    </div>
  );
}
