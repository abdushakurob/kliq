"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useGeminiLive } from "@/hooks/useGeminiLive";
import ReactMarkdown from "react-markdown";

export default function CreateInvoicePage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    serviceDescription: "",
    amount: "",
    dueDate: "",
    notesTerms: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [magicInput, setMagicInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: "assistant", content: `Hello ${session?.user?.name?.split(' ')[0] || ''}! Ready to bill for your next project? Just tell me what you did and for whom.` }
  ]);
  const [isParsingAI, setIsParsingAI] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);

  // Auto-scroll logic for transcript
  const scrollRef = React.useRef<HTMLDivElement>(null);


  // Gemini Live Hook
  const {
    isConnecting,
    isListening: isLiveListening,
    messages: liveMessages,
    transcript: liveTranscript,
    rawTranscript,
    error: liveError,
    startSession: startLiveSession,
    stopSession: stopLiveSession
  } = useGeminiLive(
    process.env.NEXT_PUBLIC_RELAY_URL || "",
    `You are the Kliq Invoice Assistant, a professional and supportive advisor. 
    Speak in clear, professional Standard Nigerian English. Use a very respectful, encouraging, and business-focused tone. USE NIGERIAN ACCENT TO SPEAK.

    GOAL: Gather the Client Name, Client Email (optional), Service Details, and Amount to generate an invoice.
    
    IMPORTANT RULES:
    1. The names mentioned by the user are the CLIENT'S names or BUSINESS names (the person/entity being billed). You do NOT need the user's name.
    2. Suggest professional descriptions: If the user says something vague like "I did some photography", suggest a better line item like "Professional Event Photography & Post-Processing".
    3. Email is optional: If they provide a client email, capture it. If not, it's fine, but feel free to ask "Would you like to add their email to send this directly?"
    4. ONLY discuss pricing strategies if the user explicitly asks for help deciding what to charge.
    5. Convert Dollars (e.g. "$100") to Naira at 1,500 NGN/USD.
    
    TONE: 
    - Conversational, professional, and Voice-first.
    - NEVER read code, JSON, brackets, or markdown out loud.
    - Say "I've updated the form for you" once you have the details.

    OUTPUT FORMAT:
    When you have collected details, SILENTLY append this JSON code block at the very end of your response. Do not read it:
    \`\`\`json
    {
      "clientName": "...",
      "clientEmail": "...",
      "serviceDetails": "...",
      "amount": 0,
      "dueDate": "YYYY-MM-DD"
    }
    \`\`\``
  );

  // Auto-scroll logic for transcript
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, liveTranscript, liveMessages]);

  // Transfer Live Errors to UI
  useEffect(() => {
    if (liveError) setError(liveError);
  }, [liveError]);

  // Sync Live Messages & Extract JSON Background
  useEffect(() => {
    if (liveMessages.length > 0) {
      const lastLive = liveMessages[liveMessages.length - 1];
      setMessages(prev => [...prev, lastLive]);
    }

    // Scan all live messages or the raw transcript for form updates
    if (rawTranscript) {
      // Look for ```json ... ``` or just a raw object containing "clientName"
      const jsonMatch = rawTranscript.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
        || rawTranscript.match(/\{[\s\S]*?"clientName"[\s\S]*?\}/i);

      if (jsonMatch) {
        try {
          // Parse the found block (jsonMatch[1] if markdown, jsonMatch[0] if raw braces)
          const jsonString = jsonMatch[1] ? jsonMatch[1] : jsonMatch[0];
          const parsed = JSON.parse(jsonString);

          if (parsed.clientName || parsed.serviceDetails || parsed.amount) {
            setFormData(f => ({
              ...f,
              clientName: parsed.clientName || f.clientName,
              clientEmail: parsed.clientEmail || f.clientEmail,
              serviceDescription: parsed.serviceDetails || f.serviceDescription,
              amount: parsed.amount?.toString() || f.amount,
              dueDate: parsed.dueDate || f.dueDate
            }));
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

    const userText = magicInput.trim();
    const newHistory = [...messages, { role: "user", content: userText }];
    setMessages(newHistory);
    setMagicInput("");
    setIsParsingAI(true);
    setError("");

    try {
      let historyToSend = newHistory;
      // Filter out ANY model/assistant messages at the absolute beginning of the array
      while (historyToSend.length > 0 && historyToSend[0].role === "assistant") {
        historyToSend = historyToSend.slice(1);
      }

      const historyPayload = historyToSend.map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));

      const res = await fetch("/api/ai/parse-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historyPayload })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.reply) {
        setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
      }

      if (data.parsed) {
        setFormData(prev => ({
          ...prev,
          clientName: data.parsed.clientName || prev.clientName,
          clientEmail: data.parsed.clientEmail || prev.clientEmail,
          serviceDescription: data.parsed.serviceDetails || prev.serviceDescription,
          amount: data.parsed.amount?.toString() || prev.amount,
          dueDate: data.parsed.dueDate || prev.dueDate
        }));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsParsingAI(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCreateInvoice = async (status: "draft" | "sent") => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, status }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create invoice");
      }

      router.push("/invoices");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
            <div className="p-4 bg-error-container text-on-error-container rounded-xl font-medium">
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
                    {isLiveMode ? 'Exit Session' : 'Switch to Voice'}
                  </button>
                  <div className={`${isLiveMode || isListening ? 'bg-secondary-fixed' : 'bg-surface-container-highest/20'} text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full transition-colors`}>
                    {isLiveMode ? 'Live Relay' : isListening ? 'Listening' : 'Ready'}
                  </div>
                </div>
              </div>

              {/* Chat View / Transcript */}
              <div
                ref={scrollRef}
                className="mb-6 space-y-4 max-h-[500px] overflow-y-auto pr-2 min-h-[100px] scroll-smooth selection:bg-white/20 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/30"
              >
                {isLiveMode ? (
                  // BIG BOLD Live Transcript View
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="p-8">
                      <div className="text-4xl md:text-5xl font-black leading-tight text-white italic transition-all duration-300">
                        {/* Split transcript into words for trailing highlight effect */}
                        {liveTranscript.split(" ").map((word, index, arr) => {
                          const isRecent = index >= arr.length - 7;
                          return (
                            <span
                              key={index}
                              className={`inline-block mr-[0.3em] transition-colors duration-500 ${isRecent ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'text-white/40'}`}
                            >
                              {word}
                            </span>
                          );
                        })}
                        {isLiveListening && (
                          <span className="inline-block w-4 h-[1em] bg-secondary-fixed ml-2 animate-pulse align-middle"></span>
                        )}
                        {!liveTranscript && "Listening..."}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Classic Chat Bubbles
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
                      // Connecting spinner — shown between click and setupComplete
                      <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-white animate-spin">progress_activity</span>
                      </div>
                    ) : (
                      // Active/stop button
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

                    <p className="text-sm font-bold text-secondary-fixed-dim animate-pulse text-center">
                      {isConnecting ? 'Connecting to Kliq AI...' : isLiveListening ? 'Kliq is listening in real-time...' : 'Click to start Live Audio convo'}
                    </p>
                  </div>
                ) : (
                  <>
                    <textarea
                      className="w-full bg-white/10 border-0 rounded-2xl p-4 pr-32 text-white placeholder:text-white/40 focus:ring-2 focus:ring-secondary-fixed transition-all text-sm resize-none font-body shadow-inner"
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

          {/* Manual Form */}
          <div className="p-8 rounded-3xl bg-surface-container-lowest shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-2 mb-8">
              <div className="h-px flex-1 bg-surface-container-highest"></div>
              <span className="text-xs font-bold text-on-surface-variant tracking-widest uppercase px-3">or fill manually</span>
              <div className="h-px flex-1 bg-surface-container-highest"></div>
            </div>
            <form className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide ml-1">Client Name</label>
                  <input name="clientName" value={formData.clientName} onChange={handleChange} className="w-full h-14 px-5 rounded-2xl bg-surface-container-high border-0 focus:ring-2 focus:ring-primary transition-all font-medium" placeholder="E.g. Kolawole Adedeji" type="text" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide ml-1">Email Address</label>
                  <input name="clientEmail" value={formData.clientEmail} onChange={handleChange} className="w-full h-14 px-5 rounded-2xl bg-surface-container-high border-0 focus:ring-2 focus:ring-primary transition-all font-medium" placeholder="client@company.com" type="email" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide ml-1">Service Description</label>
                <input name="serviceDescription" value={formData.serviceDescription} onChange={handleChange} className="w-full h-14 px-5 rounded-2xl bg-surface-container-high border-0 focus:ring-2 focus:ring-primary transition-all font-medium" placeholder="E.g. 3-hour Outdoor Photography" type="text" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide ml-1">Amount (NGN)</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant">₦</span>
                    <input name="amount" value={formData.amount} onChange={handleChange} className="w-full h-14 pl-10 pr-5 rounded-2xl bg-surface-container-high border-0 focus:ring-2 focus:ring-primary transition-all font-bold" placeholder="50000" type="number" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide ml-1">Due Date</label>
                  <input name="dueDate" value={formData.dueDate} onChange={handleChange} className="w-full h-14 px-5 rounded-2xl bg-surface-container-high border-0 focus:ring-2 focus:ring-primary transition-all font-medium" type="date" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide ml-1">Notes / Terms</label>
                <textarea name="notesTerms" value={formData.notesTerms} onChange={handleChange} className="w-full p-5 rounded-2xl bg-surface-container-high border-0 focus:ring-2 focus:ring-primary transition-all font-medium resize-none" placeholder="Include bank details or specific terms..." rows={3}></textarea>
              </div>
            </form>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => handleCreateInvoice("sent")}
              disabled={loading}
              className="flex-1 h-16 rounded-2xl bg-secondary-fixed text-on-secondary-fixed font-bold text-lg flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-secondary-fixed/20 transition-all active:scale-[0.98] disabled:opacity-70"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
              {loading ? "Sending..." : "Create & Send Invoice"}
            </button>
            <button
              onClick={() => handleCreateInvoice("draft")}
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
            <div className="h-2 bg-gradient-to-r from-primary via-primary-container to-secondary-fixed"></div>
            <div className="p-10 relative z-10">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <h4 className="text-2xl font-black text-primary tracking-tighter font-headline">Kliq</h4>
                  <div className="mt-4 space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">From</p>
                    <p className="text-sm font-bold">{session?.user?.name || "Business Name"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <h5 className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-2">Invoice Preview</h5>
                  <div className="bg-secondary-container/30 text-on-secondary-container text-[10px] font-bold px-2 py-1 rounded-full inline-block">DRAFT</div>
                </div>
              </div>
              <div className="space-y-8">
                <div className="flex justify-between items-end border-b border-surface-container py-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Bill To</p>
                    <p className="text-lg font-bold">{formData.clientName || 'Client Name'}</p>
                    <p className="text-sm text-on-surface-variant">{formData.clientEmail || ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Issue Date</p>
                    <p className="text-sm font-bold">{new Date().toLocaleDateString('en-GB')}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-on-surface-variant border-b border-surface-container pb-2">
                    <span>Description</span>
                    <span>Amount</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <div className="max-w-[70%]">
                      <p className="font-bold text-primary font-headline">{formData.serviceDescription || 'Service...'}</p>
                    </div>
                    <p className="font-bold text-primary font-headline">₦ {Number(formData.amount || 0).toLocaleString()}</p>
                  </div>
                </div>
                <div className="pt-8 space-y-3">
                  <div className="flex justify-between pt-4 border-t-2 border-primary/5">
                    <span className="text-lg font-black text-primary font-headline">Total</span>
                    <div className="text-right">
                      <span className="text-2xl font-black text-primary tracking-tight font-headline">₦ {Number(formData.amount || 0).toLocaleString()}</span>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">Due by {formData.dueDate || '...'}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-12 p-6 rounded-2xl bg-surface-container-low border-l-4 border-secondary-fixed">
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Designer&apos;s Note</p>
                  <p className="text-xs text-on-surface italic leading-relaxed">&quot;{formData.notesTerms || '...'}&quot;</p>
                </div>
              </div>
              <div className="mt-12 flex justify-center opacity-10 grayscale pointer-events-none absolute bottom-4 w-full left-0 z-0 overflow-hidden">
                <h4 className="text-[8rem] font-black text-primary tracking-tighter italic select-none">Kliq</h4>
              </div>
            </div>
          </div>
          <p className="text-center mt-6 text-xs text-on-surface-variant font-medium flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm">visibility</span>
            Real-time preview of your professional invoice
          </p>
        </section>
      </div>
    </>
  );
}
