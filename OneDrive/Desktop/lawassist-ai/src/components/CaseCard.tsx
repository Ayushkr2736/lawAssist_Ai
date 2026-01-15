"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, CheckCircle2 } from "lucide-react";

interface CaseCardProps {
    id: string;
    title: string;
    status: "active" | "completed";
    createdAt: string;
}

export default function CaseCard({
    id,
    title,
    status,
    createdAt,
}: CaseCardProps) {
    const formattedDate = new Date(createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    return (
        <Link href={status === "completed" ? `/dashboard/case/${id}/solution` : `/dashboard/case/${id}`}>
            <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10 hover:border-amber-500/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center shrink-0 group-hover:from-amber-500/30 group-hover:to-orange-500/30 transition-all">
                                <FileText className="w-5 h-5 text-amber-600" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-semibold line-clamp-2 group-hover:text-amber-600 transition-colors">
                                    {title}
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    {formattedDate}
                                </div>
                            </div>
                        </div>
                        <Badge
                            variant={status === "completed" ? "default" : "secondary"}
                            className={
                                status === "completed"
                                    ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                                    : "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
                            }
                        >
                            {status === "completed" ? (
                                <>
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Solved
                                </>
                            ) : (
                                "In Progress"
                            )}
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
