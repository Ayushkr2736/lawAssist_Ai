"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatMessage from "@/components/ChatMessage";
import { ArrowLeft, Send, Loader2, Sparkles, Plus } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    createdAt: string;
}

interface CaseData {
    id: string;
    title: string;
    status: "active" | "completed";
    solution?: string;
}

export default function CaseChatPage({
    params,
}: {
    params: Promise<{ caseId: string }>;
}) {
    const { caseId } = use(params);
    const router = useRouter();
    const [caseData, setCaseData] = useState<CaseData | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [aiResponding, setAiResponding] = useState(false);
    const [readyForSolution, setReadyForSolution] = useState(false);
    const [generatingSolution, setGeneratingSolution] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        fetchCase();
    }, [caseId]);

    useEffect(() => {
        // Auto-scroll to bottom when messages change
        scrollToBottom();
    }, [messages, aiResponding]);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        // Get initial AI response after loading
        if (messages.length === 1 && !loading && caseData?.status === "active") {
            getAiFollowup();
        }
    }, [messages.length, loading, caseData?.status]);

    const fetchCase = async () => {
        try {
            const response = await fetch(`/api/cases/${caseId}`);
            const data = await response.json();
            if (data.success) {
                setCaseData(data.case);
                setMessages(data.messages);
                if (data.case.status === "completed") {
                    router.push(`/dashboard/case/${caseId}/solution`);
                }
            } else {
                router.push("/dashboard");
            }
        } catch (error) {
            console.error("Error fetching case:", error);
            router.push("/dashboard");
        } finally {
            setLoading(false);
        }
    };

    const getAiFollowup = async () => {
        setAiResponding(true);
        try {
            const response = await fetch("/api/ai/followup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    caseId,
                    messages: messages.map((m) => ({ role: m.role, content: m.content })),
                }),
            });

            const data = await response.json();
            if (data.success) {
                setMessages((prev) => [...prev, data.message]);
                if (data.readyForSolution) {
                    setReadyForSolution(true);
                }
            }
        } catch (error) {
            console.error("Error getting AI response:", error);
        } finally {
            setAiResponding(false);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || sending) return;

        const userMessage = input.trim();
        setInput("");
        setSending(true);

        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }

        try {
            const response = await fetch(`/api/cases/${caseId}/message`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: userMessage }),
            });

            const data = await response.json();
            if (data.success) {
                setMessages((prev) => [...prev, data.message]);
                // Get AI follow-up after user message
                setTimeout(() => getAiFollowup(), 500);
            }
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setSending(false);
        }
    };

    const handleGenerateSolution = async () => {
        setGeneratingSolution(true);
        try {
            const response = await fetch("/api/ai/solution", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    caseId,
                    messages: messages.map((m) => ({ role: m.role, content: m.content })),
                }),
            });

            const data = await response.json();
            if (data.success) {
                router.push(`/dashboard/case/${caseId}/solution`);
            } else {
                alert(data.error || "Failed to generate solution");
            }
        } catch (error) {
            console.error("Error generating solution:", error);
            alert("Failed to generate solution");
        } finally {
            setGeneratingSolution(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (loading) {
        return (
            <div className="h-[calc(100vh-4rem)] flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-muted-foreground animate-pulse">Loading conversation...</p>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col bg-slate-50/50 dark:bg-background">
            {/* Header */}
            <div className="border-b border-border/40 bg-background/80 backdrop-blur-xl px-4 py-3 shadow-sm z-10">
                <div className="container mx-auto max-w-4xl flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon" className="shrink-0 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </Button>
                    </Link>
                    <div className="flex-1 min-w-0">
                        <h1 className="font-semibold truncate text-slate-900 dark:text-slate-100">{caseData?.title}</h1>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <p className="text-xs text-muted-foreground">AI Assistant Active</p>
                        </div>
                    </div>

                    <Link href="/dashboard">
                        <Button variant="outline" size="sm" className="hidden sm:flex gap-2 text-amber-600 border-amber-200 hover:bg-amber-50 dark:border-amber-900/50 dark:hover:bg-amber-900/20">
                            <Plus className="w-4 h-4" />
                            New Case
                        </Button>
                    </Link>

                    {readyForSolution && (
                        <Button
                            onClick={handleGenerateSolution}
                            disabled={generatingSolution}
                            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shrink-0 shadow-md shadow-amber-500/20"
                        >
                            {generatingSolution ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Get Solution
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>

            {/* Chat Messages */}
            <ScrollArea className="flex-1">
                <div className="container mx-auto max-w-4xl px-4 py-6 space-y-6">
                    {messages.map((message) => (
                        <ChatMessage
                            key={message.id}
                            role={message.role}
                            content={message.content}
                        />
                    ))}
                    {aiResponding && <ChatMessage role="assistant" content="" isLoading />}
                    <div ref={scrollRef} className="h-4" />
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t border-border/40 bg-background/80 backdrop-blur-xl px-4 py-4 z-10">
                <div className="container mx-auto max-w-4xl">
                    <div className="relative flex items-end gap-3 p-2 bg-white dark:bg-muted/30 rounded-3xl border border-border/60 shadow-sm focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500/50 transition-all">
                        <Textarea
                            ref={textareaRef}
                            placeholder={aiResponding ? "AI is typing..." : "Type your response..."}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={1}
                            className="min-h-[44px] max-h-32 w-full resize-none border-0 bg-transparent focus-visible:ring-0 px-4 py-3 placeholder:text-muted-foreground/70"
                            disabled={sending || aiResponding || readyForSolution}
                        />
                        <Button
                            onClick={handleSend}
                            disabled={!input.trim() || sending || aiResponding || readyForSolution}
                            size="icon"
                            className={
                                !input.trim() || sending || aiResponding || readyForSolution
                                    ? "mb-1 mr-1 h-10 w-10 shrink-0 rounded-full bg-muted text-muted-foreground"
                                    : "mb-1 mr-1 h-10 w-10 shrink-0 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md hover:shadow-lg transition-all hover:scale-105"
                            }
                        >
                            {sending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5 ml-0.5" />
                            )}
                        </Button>
                    </div>

                    {readyForSolution && (
                        <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/30 text-center animate-in fade-in slide-in-from-bottom-2">
                            <p className="text-sm text-amber-800 dark:text-amber-200 flex items-center justify-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                The AI has gathered enough information. Click &quot;Get Solution&quot; above to receive your legal guidance.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
