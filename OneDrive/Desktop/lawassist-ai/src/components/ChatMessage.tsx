"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ChatMessageProps {
    role: "user" | "assistant";
    content: string;
    isLoading?: boolean;
}

export default function ChatMessage({
    role,
    content,
    isLoading,
}: ChatMessageProps) {
    return (
        <div
            className={cn(
                "flex w-full gap-3 max-w-3xl mx-auto py-2",
                role === "user" ? "justify-end" : "justify-start"
            )}
        >
            {role === "assistant" && (
                <Avatar className="h-8 w-8 shrink-0 mt-1">
                    <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-800 text-white shadow-sm">
                        <Bot className="h-4 w-4" />
                    </AvatarFallback>
                </Avatar>
            )}

            <div
                className={cn(
                    "relative px-4 py-3 rounded-2xl max-w-[80%] shadow-sm",
                    role === "user"
                        ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-tr-sm"
                        : "bg-white dark:bg-muted border border-border/50 rounded-tl-sm"
                )}
            >
                {role === "assistant" && (
                    <p className="text-xs font-semibold mb-1 text-slate-500 dark:text-slate-400">
                        LawAssist AI
                    </p>
                )}

                {isLoading ? (
                    <div className="space-y-2 min-w-[150px]">
                        <Skeleton className="h-4 w-[90%] bg-slate-200 dark:bg-slate-700" />
                        <Skeleton className="h-4 w-[60%] bg-slate-200 dark:bg-slate-700" />
                    </div>
                ) : (
                    <p className={cn("text-sm leading-relaxed whitespace-pre-wrap", role === "user" ? "text-white" : "text-foreground")}>
                        {content}
                    </p>
                )}
            </div>

            {role === "user" && (
                <Avatar className="h-8 w-8 shrink-0 mt-1">
                    <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm">
                        <User className="h-4 w-4" />
                    </AvatarFallback>
                </Avatar>
            )}
        </div>
    );
}
