import React, { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Camera, CameraOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PreCallScreenProps {
  callType: "audio" | "video";
  onJoin: () => void;
  onCancel: () => void;
}

export default function PreCallScreen({ callType, onJoin, onCancel }: PreCallScreenProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(callType === "video");

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
  const toggleMic = () => {
    if (!stream) return;
    stream.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    setMicOn(!micOn);
  };

  const toggleCam = () => {
    if (!stream) return;
    stream.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    setCamOn(!camOn);
  };

  return (
    <div className="fixed inset-0 bg-[#1c1c1c] flex items-center justify-center z-[9999]">

      {/* Video Preview */}
      <div className="rounded-xl overflow-hidden shadow-2xl border border-white/10 w-[600px] h-[350px] relative">
        {callType === "video" ? (
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-black flex items-center justify-center text-white text-xl">
            Audio Call – No Video
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-10 flex items-center gap-6">

        {/* Mic Button */}
        <Button
          variant="outline"
          className="rounded-full h-14 w-14 bg-white/10 border-white/20"
          onClick={toggleMic}
        >
          {micOn ? <Mic className="text-white" /> : <MicOff className="text-red-400" />}
        </Button>

        {/* Camera Button */}
        {callType === "video" && (
          <Button
            variant="outline"
            className="rounded-full h-14 w-14 bg-white/10 border-white/20"
            onClick={toggleCam}
          >
            {camOn ? <Camera className="text-white" /> : <CameraOff className="text-red-400" />}
          </Button>
        )}

        {/* Join Button */}
        <Button
          className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-4 rounded-full"
          onClick={() => {
            stopPreviewStream();
            onJoin();
          }}
        >
          Join Call
        </Button>

        {/* Cancel */}
        <Button
          className="bg-red-600 hover:bg-red-700 text-white text-lg px-8 py-4 rounded-full"
          onClick={() => {
            stopPreviewStream();
            onCancel();
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
