    // src/lib/CallManager.ts
    import { Socket } from "socket.io-client";

    export type CallType = "audio" | "video";

    class CallManager {
    private socket: Socket | null = null;
    private pc: RTCPeerConnection | null = null;
    private localStream: MediaStream | null = null;
    private remoteStream: MediaStream | null = null;

    // 🔵 IMPORTANT: store the target user (for call:end)
    private currentTargetId: string | null = null;

    // event handlers set from React
    onIncomingCall: (data: any) => void = () => {};
    onCallConnected: (remote: MediaStream) => void = () => {};
    onCallEnded: () => void = () => {};

    initSocket(socket: Socket) {
        this.socket = socket;

        socket.on("call:offer", async (data) => {
        this.onIncomingCall(data);
        });

        socket.on("call:answer", async ({ sdp }) => {
        if (!this.pc) return;
        await this.pc.setRemoteDescription(new RTCSessionDescription(sdp));
        });

        socket.on("call:candidate", ({ candidate }) => {
        if (candidate) {
            this.pc?.addIceCandidate(new RTCIceCandidate(candidate));
        }
        });

        socket.on("call:end", () => {
        this.endCall(false); // don't send back to server
        });
    }

    async startCall(targetId: string, callType: CallType = "video") {
        this.currentTargetId = targetId;

        // Always recreate peer connection
            await this.createPeerConnection();

            const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: callType === "video"
            });
            this.localStream = stream;
            
            // SAFETY CHECK
            if (!this.pc) {
            console.error("PC not initialized before adding tracks");
            return null;
            }

            stream.getTracks().forEach((t) => {
            this.pc!.addTrack(t, this.localStream!);
            });

        const offer = await this.pc!.createOffer();
        await this.pc!.setLocalDescription(offer);

        this.socket?.emit("call:offer", {
        to: targetId,
        sdp: offer,
        callType
        });

        return this.localStream;
    }

    async acceptCall(fromUserId: string, sdp: any, callType: CallType) {
        this.currentTargetId = fromUserId;

        await this.createPeerConnection();

        const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === "video"
        });
        this.localStream = stream

        if (!this.pc) {
        console.error("PC missing in acceptCall");
        return null;
        }

        stream.getTracks().forEach((t) => {
        this.pc!.addTrack(t, this.localStream!);
        });


        await this.pc!.setRemoteDescription(new RTCSessionDescription(sdp));

        const answer = await this.pc!.createAnswer();
        await this.pc!.setLocalDescription(answer);

        this.socket?.emit("call:answer", {
        to: fromUserId,
        sdp: answer
        });

        return this.localStream;
    }

    private async createPeerConnection() {
        this.pc = new RTCPeerConnection({
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },
              {
                urls: "turn:relay1.expressturn.com:3478",
                username: "ef9HYT2bV5W3sQcgHXP9uPqEErY468Bb",
                credential: "pXfvbJg1GtDatz4D"
              }
            ]
          });
        
          this.remoteStream = new MediaStream();

        this.pc.ontrack = (e) => {
        this.remoteStream?.addTrack(e.track);
        this.onCallConnected(this.remoteStream!);
        };

        this.pc.onicecandidate = (e) => {
        if (e.candidate) {
            this.socket?.emit("call:candidate", {
            to: this.currentTargetId,
            candidate: e.candidate
            });
        }
        };

        this.pc.onconnectionstatechange = () => {
        // if (
        //     this.pc?.connectionState === "failed" ||
        //     this.pc?.connectionState === "disconnected"
        // ) {
        //     this.endCall();
        // }
        const state = this.pc?.connectionState;
        console.log("Ice State:", state);
        };
    }

    /**
     * @param notifyServer – Whether to send "call:end" to remote user
     */
    endCall(notifyServer = true) {
        console.log("🔴 Ending call…");
      
        try {
          // -----------------------------  
          // 1. STOP ALL TRACKS FROM SENDERS (MOST IMPORTANT)
          // -----------------------------
          if (this.pc) {
            this.pc.getSenders().forEach((sender) => {
              if (sender.track) {
                console.log("Stopping sender track:", sender.track.kind);
                try { sender.track.stop(); } catch {}
              }
            });
      
            this.pc.getReceivers().forEach((receiver) => {
              if (receiver.track) {
                console.log("Stopping receiver track:", receiver.track.kind);
                try { receiver.track.stop(); } catch {}
              }
            });
          }
      
          // -----------------------------
          // 2. STOP LOCAL STREAM TRACKS
          // -----------------------------
          if (this.localStream) {
            this.localStream.getTracks().forEach((track) => {
              console.log("Stopping LOCAL stream track:", track.kind);
              try { track.stop(); } catch {}
            });
          }
      
          // -----------------------------
          // 3. CLOSE PEER CONNECTION
          // -----------------------------
          if (this.pc) {
            this.pc.ontrack = null;
            this.pc.onicecandidate = null;
            this.pc.onconnectionstatechange = null;
      
            try { this.pc.close(); } catch {}
          }
      
          // -----------------------------
          // 4. CLEAR STREAM REFERENCES
          // -----------------------------
          this.pc = null;
          this.localStream = null;
          this.remoteStream = null;
      
          // -----------------------------
          // 5. Notify UI
          // -----------------------------
          this.onCallEnded();
      
          // -----------------------------
          // 6. Notify remote peer
          // -----------------------------
          if (notifyServer && this.currentTargetId) {
            this.socket?.emit("call:end", { to: this.currentTargetId });
          }
      
        } catch (err) {
          console.error("Error ending call:", err);
        }
      
        this.currentTargetId = null;
        console.log("🔴 Call ended. Camera & mic OFF.");
      }
      
      
      
    
    }

    export const callManager = new CallManager();
