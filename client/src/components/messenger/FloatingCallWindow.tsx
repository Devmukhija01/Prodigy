import React, { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Camera, CameraOff, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FloatingCallWindowProps {
  local: MediaStream | null;
  remote: MediaStream | null;
  onEnd: () => void;
}

export default function FloatingCallWindow({
  local,
  remote,
  onEnd
}: FloatingCallWindowProps) {
  const localRef = useRef<HTMLVideoElement | null>(null);
  const remoteRef = useRef<HTMLVideoElement | null>(null);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);

  useEffect(() => {
    if (local && localRef.current) {
      localRef.current.srcObject = local;
    }
  }, [local]);

  useEffect(() => {
    if (remote && remoteRef.current) {
      remoteRef.current.srcObject = remote;
    }
  }, [remote]);

  const toggleMic = () => {
    if (!local) return;
    local.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    setMicOn((s) => !s);
  };

  const toggleCamera = () => {
    if (!local) return;
    local.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    setCamOn((s) => !s);
  };

  return (
    <div className="fixed bottom-4 right-4 w-[340px] h-[480px] rounded-xl bg-black overflow-hidden shadow-xl border border-white/10 z-[9999]">
      {/* Remote video */}
      <video
        ref={remoteRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />

      {/* Local video preview */}
      {local && (
        <video
          ref={localRef}
          muted
          autoPlay
          playsInline
          className="absolute bottom-4 right-4 w-28 h-40 object-cover rounded-lg shadow-lg border border-white/30"
        />
      )}

      {/* Controls bar */}
      <div className="absolute bottom-0 w-full bg-black/40 flex items-center justify-center gap-4 py-3">
        <Button
          className="rounded-full h-12 w-12 bg-white/20 hover:bg-white/30"
          onClick={toggleMic}
        >
          {micOn ? (
            <Mic className="h-5 w-5 text-white" />
          ) : (
            <MicOff className="h-5 w-5 text-red-400" />
          )}
        </Button>

        <Button
          className="rounded-full h-12 w-12 bg-white/20 hover:bg-white/30"
          onClick={toggleCamera}
        >
          {camOn ? (
            <Camera className="h-5 w-5 text-white" />
          ) : (
            <CameraOff className="h-5 w-5 text-red-400" />
          )}
        </Button>

        <Button
          className="rounded-full h-12 w-12 bg-red-600 hover:bg-red-700 text-white"
          onClick={onEnd}
        >
          <PhoneOff className="h-5 w-5 rotate-45" />
        </Button>
      </div>
    </div>
  );
}
