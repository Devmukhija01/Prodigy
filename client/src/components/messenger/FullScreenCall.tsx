import React, { useEffect, useRef } from "react";
import { Mic, MicOff, Camera, CameraOff, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FullScreenCallProps {
  local: MediaStream | null;
  remote: MediaStream | null;
  onEnd: () => void;
  callType: "audio" | "video";
}

export default function FullScreenCall({ local, remote, onEnd, callType }: FullScreenCallProps) {
  const localRef = useRef<HTMLVideoElement | null>(null);
  const remoteRef = useRef<HTMLVideoElement | null>(null);

  const isVideoCall = callType === "video";
  const isAudioCall = callType === "audio";

  useEffect(() => {
    if (localRef.current && local) localRef.current.srcObject = local;
    if (remoteRef.current && remote) remoteRef.current.srcObject = remote;

    return () => {
      if (localRef.current) {
        localRef.current.pause();
        localRef.current.srcObject = null;
      }
      if (remoteRef.current) {
        remoteRef.current.pause();
        remoteRef.current.srcObject = null;
      }
    };
    
  }, [local, remote]);

  const [micOn, setMicOn] = React.useState(true);
  const [camOn, setCamOn] = React.useState(true);

  const toggleMic = () => {
    if (!local) return;
    local.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    setMicOn(!micOn);
  };

  const toggleCam = () => {
    if (!local) return;
    local.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    setCamOn(!camOn);
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-[99999]">

      {/* REMOTE video (full screen) */}
      {isVideoCall && (
        <video
          ref={remoteRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* LOCAL small preview */}
      {isVideoCall && (
        <video
          ref={localRef}
          muted
          autoPlay
          playsInline
          className="absolute bottom-6 right-6 w-52 h-36 object-cover rounded-xl shadow-xl border border-white/20"
        />
      )}

      {/* Controls */}
      <div className="absolute bottom-8 w-full flex justify-center gap-6">
        {/* Mic */}
        <Button
          className="rounded-full h-16 w-16 bg-white/10 hover:bg-white/20"
          onClick={toggleMic}
        >
          {micOn ? <Mic className="text-white" /> : <MicOff className="text-red-400" />}
        </Button>

        {/* Camera only for VIDEO CALL */}
        {isVideoCall && (
          <Button
            className="rounded-full h-16 w-16 bg-white/10 hover:bg-white/20"
            onClick={toggleCam}
          >
            {camOn ? <Camera className="text-white" /> : <CameraOff className="text-red-400" />}
          </Button>
        )}

        {/* END CALL */}
        <Button
          className="rounded-full h-16 w-16 bg-red-600 hover:bg-red-700"
          onClick={onEnd}
        >
          <PhoneOff className="text-white rotate-45 h-7 w-7" />
        </Button>
      </div>

    </div>
  );
}
