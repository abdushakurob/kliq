"use client";

import { useState, useRef, useCallback } from "react";

export function useGeminiLive(relayUrl: string, systemPrompt: string) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [transcript, setTranscript] = useState(""); // NEW: Continuous transcript
  const [cleanTranscript, setCleanTranscript] = useState(""); // NEW: Transcript without JSON
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const setupCompleteRef = useRef(false);
  const nextPlayTimeRef = useRef(0);

  const stopSession = useCallback(() => {
    processorRef.current?.disconnect();
    processorRef.current = null;

    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;

    if (audioContextRef.current?.state !== 'closed') {
      audioContextRef.current?.close();
    }
    audioContextRef.current = null;

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.close(1000, 'User stopped session');
    }
    socketRef.current = null;
    setupCompleteRef.current = false;
    nextPlayTimeRef.current = 0;

    setIsConnecting(false); // NEW
    setIsListening(false);
    setIsProcessing(false);
  }, []);

  function startMicStream(audioContext: AudioContext, stream: MediaStream, socket: WebSocket) {
    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);
    processorRef.current = processor;

    processor.onaudioprocess = (e) => {
      if (socket.readyState !== WebSocket.OPEN || !setupCompleteRef.current) return;
      const float32 = e.inputBuffer.getChannelData(0);
      const pcm16 = new Int16Array(float32.length);
      for (let i = 0; i < float32.length; i++) {
        pcm16[i] = Math.max(-32768, Math.min(32767, Math.round(float32[i] * 32767)));
      }
      socket.send(pcm16.buffer);
    };

    source.connect(processor);
    processor.connect(audioContext.destination);
  }

  function playAudioChunk(base64: string, audioContext: AudioContext) {
    try {
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const int16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768.0;

      const buffer = audioContext.createBuffer(1, float32.length, 24000);
      buffer.getChannelData(0).set(float32);
      const sourceNode = audioContext.createBufferSource();
      sourceNode.buffer = buffer;
      sourceNode.connect(audioContext.destination);
      const now = audioContext.currentTime;
      const startAt = Math.max(now, nextPlayTimeRef.current);
      sourceNode.start(startAt);
      nextPlayTimeRef.current = startAt + buffer.duration;
    } catch (e) {
      console.error("Audio playback error:", e);
    }
  }

  const startSession = useCallback(async () => {
    if (!relayUrl) { setError("Relay URL is missing."); return; }
    if (socketRef.current) { console.warn("Already active."); return; }

    try {
      setError(null);
      setTranscript(""); // Reset transcript on new call
      setIsConnecting(true); // Show "connecting" in UI immediately

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;

      const audioContext = new AudioContext({ sampleRate: 16000 });
      await audioContext.resume();
      audioContextRef.current = audioContext;

      const wsUrl = relayUrl.startsWith('http') ? relayUrl.replace(/^http/, 'ws') : relayUrl;
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;
      socket.binaryType = 'arraybuffer';

      socket.onopen = () => {
        console.log("✅ Connected to relay");
        socket.send(JSON.stringify({ 
          type: "setup", 
          systemPrompt,
          voice: {
            name: "Aoede" // Using a melodic voice as requested
          }
        }));
        // isConnecting stays true — waiting for setupComplete
      };

      socket.onmessage = async (event) => {
        if (event.data instanceof ArrayBuffer) return;

        let data: any;
        try { data = JSON.parse(event.data as string); }
        catch { return; }

        console.log("📥 From relay:", data);

        // ✅ FIX: Google sends setupComplete as an empty object {}, 
        // so check for key existence with 'in' not !== undefined
        if ('setupComplete' in data) {
          console.log("✅ setupComplete received — starting mic");
          setupCompleteRef.current = true;
          setIsConnecting(false); // done connecting
          setIsListening(true);   // NOW show the active UI
          startMicStream(audioContext, stream, socket);
          return;
        }

        if (data.error) {
          setError(`Relay Error: ${data.error}`);
          stopSession();
          return;
        }

        const serverContent = data.serverContent;
        if (serverContent?.modelTurn?.parts) {
          const parts = serverContent.modelTurn.parts;
          const text = parts.filter((p: any) => p.text).map((p: any) => p.text).join("").replace(/\n/g, " ");
          if (text) {
            setMessages(prev => [...prev, { role: "assistant", content: text }]);
            setTranscript(prev => {
              const newTranscript = prev + " " + text;
              // Clean out markdown blocks AND raw JSON objects
              let cleaned = newTranscript.replace(/```(?:json)?[\s\S]*?```/gi, "").trim();
              cleaned = cleaned.replace(/\{[\s\S]*?"clientName"[\s\S]*?\}/gi, "").trim();
              setCleanTranscript(cleaned);
              return newTranscript;
            });
          }

          for (const part of parts) {
            if (part.inlineData?.data && audioContextRef.current) {
              playAudioChunk(part.inlineData.data, audioContextRef.current);
            }
          }
        }

        if (serverContent?.outputTranscription?.text) {
          const userText = serverContent.outputTranscription.text.replace(/\n/g, " ");
          setTranscript(prev => {
            const newTranscript = prev + " " + userText;
            let cleaned = newTranscript.replace(/```(?:json)?[\s\S]*?```/gi, "").trim();
            cleaned = cleaned.replace(/\{[\s\S]*?"clientName"[\s\S]*?\}/gi, "").trim();
            setCleanTranscript(cleaned);
            return newTranscript;
          });
        }
      };

      socket.onerror = () => {
        setError("WebSocket connection failed. Check your relay URL.");
        stopSession();
      };

      socket.onclose = (event) => {
        console.warn(`Closed — Code: ${event.code}`);
        // 1006 is "Abnormal Closure", common on Render/Relay disconnects. 
        // 1000/1001/1005 are normally fine.
        if (event.code !== 1000 && event.code !== 1005 && event.code !== 1006) {
           setError(`Connection interrupted (Code: ${event.code}).`);
        }
        stopSession();
      };

    } catch (err: any) {
      setError(err.message || "Failed to start session");
      stopSession();
    }
  }, [relayUrl, systemPrompt, stopSession]);

  return { isConnecting, isListening, isProcessing, messages, transcript: cleanTranscript, rawTranscript: transcript, error, startSession, stopSession };
}