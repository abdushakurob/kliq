"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useGeminiLive } from "@/hooks/useGeminiLive";
import ReactMarkdown from "react-markdown";
import Wordmark from "@/components/Wordmark";

export default function CreateInvoicePage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    items: [{ description: "", quantity: 1, unitPrice: "" }],
    dueDate: "",
    notesTerms: "",
    amount: "0" // Total summary
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [magicInput, setMagicInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);

  useEffect(() => {
    if (session?.user?.name && messages.length === 0) {
      setMessages([
        { role: "assistant", content: `Hello ${session.user.name.split(' ')[0]}! Ready to bill for your next project? Just tell me what you did and for whom.` }
      ]);
    } else if (!session && messages.length === 0) {
      setMessages([
        { role: "assistant", content: "Hello! Ready to bill for your next project? Just tell me what you did and for whom." }
      ]);
    }
  }, [session, messages.length]);
  const [isParsingAI, setIsParsingAI] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);

  // Gemini Live Hook
  const {
    isConnecting,
    isListening: isLiveListening,
    messages: liveMessages,
    transcript: liveTranscript,
    rawTranscript,
    error: liveError,
    volume, // Real-time volume for waveform
    startSession: startLiveSession,
    stopSession: stopLiveSession
  } = useGeminiLive(
    process.env.NEXT_PUBLIC_RELAY_URL || "",
    `You are the Kliq Invoice Assistant, a professional and supportive advisor. 
    Speak in clear, professional Standard Nigerian English. Use a very respectful, encouraging, and business-focused tone. USE NIGERIAN ACCENT TO SPEAK.

    GOAL: Gather Client Name, Client Email (optional), and one or more ITEMS.
    
    IMPORTANT RULES:
    1. SERVICE VS PRODUCT: Identify if the user is billing for a SERVICE (e.g. "Photography") or ITEMS (e.g. "10 Prints"). 
       - For services, quantity defaults to 1.
       - For stuff/products, extract the quantity and unit price.
    2. CLIENT FOCUS: The names mentioned are the CLIENT'S names. You do NOT need the user's name.
    3. SUGGESTIONS: Suggest professional descriptions (e.g. "Brand Identity Design" instead of "Logo").
    4. Convert Dollars to Naira at 1,500 NGN/USD.
    
    TONE: Conversational, professional, and Voice-first. Say "I've updated the items list for you" once you have new details.

    OUTPUT FORMAT:
    SILENTLY append this JSON code block at the end of your response. Do not read it:
    \`\`\`json
    {
      "clientName": "...",
      "clientEmail": "...",
      "items": [
        { "description": "...", "quantity": 1, "unitPrice": 0 }
      ],
      "dueDate": "YYYY-MM-DD"
    }
    \`\`\``
  );

  // Auto-scroll logic for transcript
  const scrollRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, liveTranscript, liveMessages]);

  // Transfer Live Errors to UI (Friendly Client-side errors)
  useEffect(() => {
    if (liveError) {
      if (liveError.includes("Relay Error") || liveError.includes("WebSocket")) {
        setError("Establishing secure line failed. I'm unable to connect to the AI server right now. Please try again later.");
      } else {
        setError("Connection lost. Please check your data connection.");
      }
    }
  }, [liveError]);

  // Sync Live Messages & Extract JSON Background
  useEffect(() => {
    if (liveMessages.length > 0) {
      const lastLive = liveMessages[liveMessages.length - 1];
      setMessages(prev => [...prev, lastLive]);
    }

    if (rawTranscript) {
      const jsonMatch = rawTranscript.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
        || rawTranscript.match(/\{[\s\S]*?"clientName"[\s\S]*?\}/i);

      if (jsonMatch) {
        try {
          const jsonString = jsonMatch[1] ? jsonMatch[1] : jsonMatch[0];
          const parsed = JSON.parse(jsonString);

          if (parsed.clientName || parsed.items) {
            setFormData(f => {
              const newItems = parsed.items ? parsed.items.map((it: any) => ({
                description: it.description || "",
                quantity: it.quantity || 1,
                unitPrice: it.unitPrice?.toString() || ""
              })) : f.items;

              const total = newItems.reduce((sum: number, it: any) => sum + (Number(it.unitPrice) * Number(it.quantity)), 0);

              return {
                ...f,
                clientName: parsed.clientName || f.clientName,
                clientEmail: parsed.clientEmail || f.clientEmail,
                items: newItems,
                dueDate: parsed.dueDate || f.dueDate,
                amount: total.toString()
              };
            });
          }
        } catch (e) { }
      }
    }
  }, [liveMessages, rawTranscript]);

  // Voice Recognition (Legacy cleanup - we prioritize Live mode now)
  const startListening = () => {
    setError("Please use the 'Go Live' button for a better voice experience.");
  };

  const handleMagicInputSubmit = async () => {
    if (!magicInput.trim()) return;
    setIsParsingAI(true);
    setError("");

    try {
      const res = await fetch("/api/ai/parse-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages.map(m => ({
              role: m.role === "assistant" ? "model" : "user",
              parts: [{ text: m.content }]
            })),
            { role: "user", parts: [{ text: magicInput }] }
          ]
        }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages(prev => [...prev,
        { role: "user", content: magicInput },
        { role: "assistant", content: data.reply }
        ]);
        setMagicInput("");
      }

      if (data.parsed) {
        const p = data.parsed;
        setFormData(f => {
          const newItems = p.items ? p.items.map((it: any) => ({
            description: it.description || "",
            quantity: it.quantity || 1,
            unitPrice: it.unitPrice?.toString() || ""
          })) : f.items;

          const total = newItems.reduce((sum: number, it: any) => sum + (Number(it.unitPrice) * Number(it.quantity)), 0);

          return {
            ...f,
            clientName: p.clientName || f.clientName,
            clientEmail: p.clientEmail || f.clientEmail,
            items: newItems,
            dueDate: p.dueDate || f.dueDate,
            amount: total.toString()
          };
        });
      }
    } catch (err) {
      setError("AI was unable to process that. Please try standard input.");
    } finally {
      setIsParsingAI(false);
    }
  };

  const addItem = () => {
    setFormData(f => ({
      ...f,
      items: [...f.items, { description: "", quantity: 1, unitPrice: "" }]
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length <= 1) return;
    setFormData(f => {
      const newItems = f.items.filter((_, i) => i !== index);
      const total = newItems.reduce((sum: number, it: any) => sum + (Number(it.unitPrice) * Number(it.quantity)), 0);
      return { ...f, items: newItems, amount: total.toString() };
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    setFormData(f => {
      const newItems = [...f.items];
      newItems[index] = { ...newItems[index], [field]: value };
      const total = newItems.reduce((sum: number, it: any) => sum + (Number(it.unitPrice) * Number(it.quantity)), 0);
      return { ...f, items: newItems, amount: total.toString() };
    });
  };

  const handleSubmit = async (status: "draft" | "sent") => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, status }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create invoice");

      router.push("/invoices");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const VoiceWaveform = ({ volume }: { volume: number }) => {
    const bars = [0.4, 0.7, 1.0, 0.8, 0.5, 0.9, 0.6, 0.4];
    return (
      <div className="flex items-center gap-1 h-8">
        {bars.map((base, i) => (
          <div
            key={i}
            className="w-1 bg-white rounded-full transition-all duration-75"
            style={{
              height: `${Math.max(4, base * volume * 0.8)}px`,
              opacity: isLiveListening ? 1 : 0.3
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <header className="mb-10 flex justify-between items-end">
        <div className="space-y-1">
          <h2 className="text-4xl font-extrabold tracking-tight text-primary font-headline">Create Invoice</h2>
          <p className="text-on-surface-variant font-medium">Drafting for your next big project</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-bold text-primary font-headline">Draft Setup</p>
            <p className="text-xs text-on-surface-variant">Unsaved changes</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="User"
              className="w-full h-full object-cover"
              src={session?.user?.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuDhYQ6bM_quYbfE7N5Uuwjamulo8O70eiaaa1HvpJjh_wEQd8KTplrCND36fRP5H-_rI5bZjTZBIf4cBLUKTRILh_5Rrcy1MGtsV7KsNBw03U-GB4zns-8zroN2Gyu490gXBDxoZfxs2FLfqD6MEmHs6lP1glhEfMky3DqsbDrKZHTx61pW5sUi3_zYH06AAHgpUBpsIAwL4LvCWIFjJ3nInduNFMbE5PH_aY25VhEsZquUmwpYmeHFvZx3sLyKQBNjson3zcvi8oc"}
            />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input Forms */}
        <section className="lg:col-span-7 space-y-8">

          {error && (
            <div className="p-4 bg-error-container text-on-error-container rounded-xl font-medium border border-error/20 animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          {/* AI Conversational Input View */}
          <div className="p-8 rounded-3xl bg-primary text-white relative overflow-hidden group shadow-xl">
            <div className="relative z-10 w-full">
              <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary-fixed text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  <h3 className="text-sm font-bold tracking-widest text-primary-fixed uppercase">Kliq AI Assistant</h3>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (isLiveMode) {
                        stopLiveSession();
                        setIsLiveMode(false);
                      } else {
                        setIsLiveMode(true);
                      }
                    }}
                    className={`text-[10px] uppercase tracking-widest font-black px-3 py-1 rounded-full transition-all ${isLiveMode ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-white/10 text-white hover:bg-white/20'}`}
                  >
                    {isLiveMode ? 'End Call' : 'Switch to Voice'}
                  </button>
                  <div className={`${isLiveListening || isConnecting ? 'bg-secondary-fixed' : 'bg-surface-container-highest/20'} text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full transition-colors`}>
                    {isConnecting ? 'Secure Line...' : isLiveListening ? 'Listening' : 'Ready'}
                  </div>
                </div>
              </div>

              {/* Chat View / Transcript */}
              <div
                ref={scrollRef}
                className="mb-6 space-y-4 max-h-[500px] overflow-y-auto pr-2 min-h-[100px] scroll-smooth selection:bg-white/20 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/30"
              >
                {isLiveMode ? (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="p-12 min-h-[300px] flex items-center justify-center text-center">
                      <div className="text-4xl md:text-5xl font-black leading-tight text-white italic transition-all duration-300 drop-shadow-sm">
                        {liveTranscript ? (
                          liveTranscript.split(" ").map((word, index, arr) => {
                            const isRecent = index >= arr.length - 7;
                            return (
                              <span
                                key={index}
                                className={`inline-block mr-[0.3em] transition-all duration-500 ${isRecent ? 'text-white opacity-100 scale-110 drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]' : 'text-white/30 opacity-60 scale-100'}`}
                              >
                                {word}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-white/20 not-italic font-bold text-2xl tracking-tight animate-pulse">
                            {isConnecting ? "Establishing secure line..." : "Awaiting your voice..."}
                          </span>
                        )}
                        {isLiveListening && (
                          <span className="inline-block w-4 h-[1em] bg-secondary-fixed ml-2 animate-pulse align-middle rounded-sm shadow-[0_0_15px_rgba(var(--secondary-fixed-rgb),0.5)]"></span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-4 rounded-3xl max-w-[85%] text-sm font-medium leading-relaxed ${msg.role === 'user' ? 'bg-secondary-fixed text-on-secondary-fixed shadow-lg rounded-tr-sm' : 'bg-white/10 text-white rounded-tl-sm backdrop-blur-md border border-white/5'}`}>
                        <div className="prose prose-invert max-w-none prose-p:my-1 prose-strong:text-white prose-ul:my-2 prose-li:my-0">
                          <ReactMarkdown>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {isParsingAI && (
                  <div className="flex justify-start">
                    <div className="p-4 rounded-3xl bg-white/10 text-white rounded-tl-sm text-sm font-medium flex gap-2 items-center">
                      <span className="w-2 h-2 rounded-full bg-white animate-bounce"></span>
                      <span className="w-2 h-2 rounded-full bg-white animate-bounce delay-75"></span>
                      <span className="w-2 h-2 rounded-full bg-white animate-bounce delay-150"></span>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative mt-2">
                {isLiveMode ? (
                  <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center gap-6 group">
                    {!isLiveListening && !isConnecting ? (
                      <button
                        type="button"
                        onClick={startLiveSession}
                        className="w-20 h-20 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shadow-2xl hover:scale-105 transition-transform"
                      >
                        <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
                      </button>
                    ) : isConnecting ? (
                      <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-white animate-spin">progress_activity</span>
                      </div>
                    ) : (
                      <div className="relative flex items-center justify-center">
                        <div className="absolute w-24 h-24 bg-secondary-fixed/20 rounded-full animate-ping"></div>
                        <button
                          type="button"
                          onClick={stopLiveSession}
                          className="relative w-20 h-20 rounded-full bg-error text-white flex items-center justify-center shadow-2xl"
                        >
                          <span className="material-symbols-outlined text-4xl">stop</span>
                        </button>
                      </div>
                    )}

                    <div className="flex flex-col items-center gap-2">
                      {isLiveListening && <VoiceWaveform volume={volume} />}
                      <p className="text-sm font-bold text-secondary-fixed-dim animate-pulse text-center">
                        {isConnecting ? 'Establishing secure line...' : isLiveListening ? 'Connected & Listening' : 'Click to start conversation'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <textarea
                      className="w-full bg-white/10 border-0 rounded-2xl p-4 pr-32 text-white placeholder:text-white/40 focus:ring-2 focus:ring-secondary-fixed transition-all text-sm resize-none font-body shadow-inner px-6"
                      id="ai-input"
                      placeholder="Tell Kliq about your gig..."
                      value={magicInput}
                      onChange={(e) => setMagicInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleMagicInputSubmit();
                        }
                      }}
                    ></textarea>
                    <div className="absolute bottom-4 right-4 flex items-center gap-2">
                      <button type="button" onClick={handleMagicInputSubmit} className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-white hover:bg-surface-container transition-colors">
                        <span className="material-symbols-outlined text-sm">send</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

            </div>
            {/* Aesthetic Background Texture */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-container to-primary rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>
          </div>

          {/* Manual Form / Items Review */}
          <div className="p-8 rounded-3xl bg-surface-container-lowest shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-surface-container">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-on-surface font-headline">Review Details</h3>
              <div className="h-px flex-1 bg-surface-container mx-4"></div>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Client Name</label>
                  <input
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full h-14 px-5 rounded-2xl bg-surface-container-low border border-surface-container focus:ring-2 focus:ring-primary transition-all font-medium"
                    placeholder="E.g. Kolawole Adedeji" type="text"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Email Address</label>
                  <input
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    className="w-full h-14 px-5 rounded-2xl bg-surface-container-low border border-surface-container focus:ring-2 focus:ring-primary transition-all font-medium"
                    placeholder="client@company.com" type="email"
                  />
                </div>
              </div>

              {/* Multi-Item Form */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Invoice Items</label>
                  <button onClick={addItem} type="button" className="text-xs font-bold text-primary flex items-center gap-1 hover:brightness-110 px-3 py-1 bg-primary/5 rounded-full">
                    <span className="material-symbols-outlined text-sm">add_circle</span>
                    Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.items.map((item, idx) => (
                    <div key={idx} className="p-4 bg-surface-container-low border border-surface-container rounded-2xl relative group/item hover:border-primary/30 transition-colors">
                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12 md:col-span-6">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateItem(idx, 'description', e.target.value)}
                            placeholder="Service or Product name"
                            className="w-full p-2 bg-transparent border-b border-surface-container text-sm outline-none focus:border-primary transition-all pb-1 translate-y-1"
                          />
                        </div>
                        <div className="col-span-4 md:col-span-2">
                          <label className="text-[8px] font-bold text-on-surface-variant uppercase block mb-1">Qty</label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                            className="w-full p-2 bg-transparent border-b border-surface-container text-sm outline-none focus:border-primary transition-all font-bold"
                          />
                        </div>
                        <div className="col-span-6 md:col-span-3">
                          <label className="text-[8px] font-bold text-on-surface-variant uppercase block mb-1">Unit Price (₦)</label>
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(idx, 'unitPrice', e.target.value)}
                            placeholder="0"
                            className="w-full p-2 bg-transparent border-b border-surface-container text-sm outline-none focus:border-primary transition-all font-bold"
                          />
                        </div>
                        <div className="col-span-2 md:col-span-1 flex items-center justify-end">
                          {formData.items.length > 1 && (
                            <button onClick={() => removeItem(idx)} type="button" className="text-on-surface-variant hover:text-error transition-colors p-2">
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Due Date</label>
                  <input
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full h-14 px-5 rounded-2xl bg-surface-container-low border border-surface-container focus:ring-2 focus:ring-primary transition-all font-medium" type="date"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Total (NGN)</label>
                  <div className="h-14 px-5 rounded-2xl bg-surface-container-high border border-surface-container flex items-center font-black text-primary text-xl">
                    ₦ {Number(formData.amount).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-1">Notes / Terms</label>
                <textarea
                  value={formData.notesTerms}
                  onChange={(e) => setFormData({ ...formData, notesTerms: e.target.value })}
                  className="w-full p-5 rounded-2xl bg-surface-container-low border border-surface-container focus:ring-2 focus:ring-primary transition-all font-medium resize-none"
                  placeholder="Include bank details or specific terms..." rows={3}></textarea>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => handleSubmit("sent")}
              disabled={loading}
              className="flex-1 h-16 rounded-2xl bg-secondary-fixed text-on-secondary-fixed font-bold text-lg flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-secondary-fixed/20 transition-all active:scale-[0.98] disabled:opacity-70 group"
            >
              <span className="material-symbols-outlined group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
              {loading ? "Sending..." : "Create & Send Invoice"}
            </button>
            <button
              onClick={() => handleSubmit("draft")}
              disabled={loading}
              className="px-8 h-16 rounded-2xl bg-surface-container-highest text-primary font-bold hover:bg-surface-dim transition-colors disabled:opacity-70"
            >
              Save Draft
            </button>
          </div>
        </section>

        {/* Right Column: Live Preview */}
        <section className="lg:col-span-5 sticky top-8">
          <div className="bg-white rounded-[2rem] shadow-2xl shadow-primary/5 overflow-hidden border border-surface-container-highest/50 relative">
            {/* Preview Header Decor */}
            <div className="h-2 bg-gradient-to-r from-primary via-primary-container to-secondary-fixed shadow-sm"></div>
            <div className="p-10 relative z-10">
              <div className="flex justify-between items-start mb-12">
                <div>
                <div className="flex items-center gap-2">
                  <div className="block">
                    <Wordmark size="sm" />
                  </div>
                </div>
                  <div className="mt-4 space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">From</p>
                    <p className="text-sm font-bold">{session?.user?.name || "Business Name"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <h5 className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-2">Invoice Preview</h5>
                  <div className="bg-secondary-container/30 text-on-secondary-container text-[10px] font-bold px-3 py-1 rounded-full inline-block border border-on-secondary-container/10">DRAFT</div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex justify-between items-end border-b border-surface-container pb-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Bill To</p>
                    <p className="text-lg font-bold">{formData.clientName || 'Client Name'}</p>
                    <p className="text-sm text-on-surface-variant leading-none">{formData.clientEmail || ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Issue Date</p>
                    <p className="text-sm font-bold">{new Date().toLocaleDateString('en-GB')}</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-12 text-[10px] font-black uppercase tracking-widest text-on-surface-variant border-b border-surface-container pb-2 px-1">
                    <span className="col-span-7">Description</span>
                    <span className="col-span-2 text-center">Qty</span>
                    <span className="col-span-3 text-right">Amount</span>
                  </div>

                  {formData.items.map((it, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 text-sm">
                      <div className="col-span-7">
                        <p className="font-bold text-on-surface">{it.description || 'Service Description'}</p>
                        <p className="text-[10px] text-on-surface-variant font-bold">₦ {Number(it.unitPrice || 0).toLocaleString()} per unit</p>
                      </div>
                      <div className="col-span-2 text-center flex items-center justify-center">
                        <span className="font-bold text-on-surface-variant">×{it.quantity}</span>
                      </div>
                      <div className="col-span-3 text-right flex items-center justify-end">
                        <p className="font-black text-on-surface">₦ {(Number(it.unitPrice || 0) * Number(it.quantity || 1)).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-8 border-t-2 border-primary/5 space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-lg font-black text-primary font-headline">Total Due</span>
                    <div className="text-right">
                      <span className="text-3xl font-black text-primary tracking-tighter font-headline">₦ {Number(formData.amount || 0).toLocaleString()}</span>
                      <div className="flex items-center gap-1 mt-1 justify-end text-error">
                        <span className="material-symbols-outlined text-[10px]">schedule</span>
                        <p className="text-[10px] font-bold uppercase tracking-tighter">Pay by {formData.dueDate || 'Immediate'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 p-6 rounded-[2rem] bg-surface-container-low border-l-4 border-secondary-fixed shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]">
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Notes & Terms</p>
                  <p className="text-xs text-on-surface italic leading-relaxed">&quot;{formData.notesTerms || 'Thank you for your business.'}&quot;</p>
                </div>
              </div>
              <div className="mt-12 flex justify-center opacity-[0.03] grayscale pointer-events-none absolute bottom-4 w-full left-0 z-0 overflow-hidden">
                <Wordmark size="xl" className="italic opacity-10" />
              </div>
            </div>
          </div>
          <p className="text-center mt-6 text-xs text-on-surface-variant font-medium flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm">visibility</span>
            Real-time premium preview of your invoice
          </p>
        </section>
      </div>
    </>
  );
}
