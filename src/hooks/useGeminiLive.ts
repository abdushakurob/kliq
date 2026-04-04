"use client";

import { useState, useRef, useCallback } from "react";

export function useGeminiLive(relayUrl: string, systemPrompt: string) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const setupCompleteRef = useRef(false);
  const nextPlayTimeRef = useRef(0); // for gapless audio playback

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

    setIsListening(false);
    setIsProcessing(false);
  }, []);

  const startSession = useCallback(async () => {
    if (!relayUrl) {
      setError("Relay URL is missing. Please set NEXT_PUBLIC_RELAY_URL.");
      return;
    }
    if (socketRef.current) {
      console.warn("Session already active.");
      return;
    }

    try {
      setError(null);

      // 1. Mic access first (must happen before AudioContext for some browsers)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;

      // 2. AudioContext at 16kHz for Gemini input
      const audioContext = new AudioContext({ sampleRate: 16000 });
      // Resume must happen after a user gesture - startSession IS the user gesture
      await audioContext.resume();
      audioContextRef.current = audioContext;

      // 3. Connect WebSocket
      const wsUrl = relayUrl.startsWith('http')
        ? relayUrl.replace(/^http/, 'ws')
        : relayUrl;

      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;
      socket.binaryType = 'arraybuffer'; // ensure incoming binary is arraybuffer

      socket.onopen = () => {
        console.log("✅ Connected to Kliq Relay");
        // Send setup - DO NOT start audio yet, wait for setupComplete
        socket.send(JSON.stringify({ type: "setup", systemPrompt }));
      };

      socket.onmessage = async (event) => {
        // Handle binary (shouldn't happen from server, but guard it)
        if (event.data instanceof ArrayBuffer) return;

        let data: any;
        try {
          data = JSON.parse(event.data as string);
        } catch {
          return;
        }

        // ✅ KEY FIX: Wait for setupComplete before starting mic stream
        if (data.setupComplete !== undefined) {
          console.log("✅ Gemini setup complete — starting mic stream");
          setupCompleteRef.current = true;
          setIsListening(true);
          startMicStream(audioContext, stream, socket);
          return;
        }

        if (data.error) {
          setError(`Relay Error: ${data.error}`);
          stopSession();
          return;
        }

        // Handle model responses
        const serverContent = data.serverContent;
        if (serverContent?.modelTurn?.parts) {
          const parts = serverContent.modelTurn.parts;

          // Text
          const text = parts
            .filter((p: any) => p.text)
            .map((p: any) => p.text)
            .join("");
          if (text) {
            setMessages(prev => [...prev, { role: "assistant", content: text }]);
          }

          // Audio - play back Gemini's voice (24kHz PCM output)
          for (const part of parts) {
            if (part.inlineData?.data && audioContextRef.current) {
              playAudioChunk(part.inlineData.data, audioContextRef.current);
            }
          }
        }

        // Transcripts
        if (serverContent?.inputTranscription?.text) {
          console.log("You said:", serverContent.inputTranscription.text);
        }
        if (serverContent?.outputTranscription?.text) {
          setMessages(prev => [...prev, {
            role: "assistant",
            content: serverContent.outputTranscription.text
          }]);
        }
      };

      socket.onerror = () => {
        setError("WebSocket connection failed. Check your relay URL and Render logs.");
        stopSession();
      };

      socket.onclose = (event) => {
        console.warn(`WebSocket closed — Code: ${event.code}, Reason: ${event.reason}`);
        if (event.code !== 1000) {
          setError(`Connection lost (Code: ${event.code}). Check Render logs.`);
        }
        stopSession();
      };

    } catch (err: any) {
      console.error("startSession failed:", err);
      setError(err.message || "Failed to start audio session");
      stopSession();
    }
  }, [relayUrl, systemPrompt, stopSession]);

  // Separated out so it only runs after setupComplete
  function startMicStream(
    audioContext: AudioContext,
    stream: MediaStream,
    socket: WebSocket
  ) {
    const source = audioContext.createMediaStreamSource(stream);
    // 4096 samples @ 16kHz = ~256ms chunks, good balance for live API
    const processor = audioContext.createScriptProcessor(4096, 1, 1);
    processorRef.current = processor;

    processor.onaudioprocess = (e) => {
      if (
        socket.readyState !== WebSocket.OPEN ||
        !setupCompleteRef.current
      ) return;

      const float32 = e.inputBuffer.getChannelData(0);
      const pcm16 = new Int16Array(float32.length);
      for (let i = 0; i < float32.length; i++) {
        pcm16[i] = Math.max(-32768, Math.min(32767,
          Math.round(float32[i] * 32767)
        ));
      }
      // Send raw binary buffer — server receives as isBinary=true
      socket.send(pcm16.buffer);
    };

    source.connect(processor);
    // Connect to destination so ScriptProcessor fires (required in some browsers)
    processor.connect(audioContext.destination);
  }

  // Gapless sequential audio playback for Gemini's voice responses
  function playAudioChunk(base64: string, audioContext: AudioContext) {
    try {
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const int16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768.0;
      }

      // Gemini outputs audio at 24kHz
      const buffer = audioContext.createBuffer(1, float32.length, 24000);
      buffer.getChannelData(0).set(float32);

      const sourceNode = audioContext.createBufferSource();
      sourceNode.buffer = buffer;
      sourceNode.connect(audioContext.destination);

      // Schedule gaplessly after the previous chunk
      const now = audioContext.currentTime;
      const startAt = Math.max(now, nextPlayTimeRef.current);
      sourceNode.start(startAt);
      nextPlayTimeRef.current = startAt + buffer.duration;
    } catch (e) {
      console.error("Audio playback error:", e);
    }
  }

  return {
    isListening,
    isProcessing,
    messages,
    error,
    startSession,
    stopSession,
  };
}