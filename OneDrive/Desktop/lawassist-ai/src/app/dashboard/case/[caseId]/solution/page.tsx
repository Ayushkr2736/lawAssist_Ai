"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import PDFExport from "@/components/PDFExport";
import { ArrowLeft, Scale, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface CaseData {
    id: string;
    title: string;
    status: "active" | "completed";
    solution?: string;
    createdAt: string;
}

export default function SolutionPage({
    params,
}: {
    params: Promise<{ caseId: string }>;
}) {
    const { caseId } = use(params);
    const router = useRouter();
    const [caseData, setCaseData] = useState<CaseData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCase();
    }, [caseId]);

    const fetchCase = async () => {
        try {
            const response = await fetch(`/api/cases/${caseId}`);
            const data = await response.json();
            if (data.success) {
                if (!data.case.solution) {
                    router.push(`/dashboard/case/${caseId}`);
                    return;
                }
                setCaseData(data.case);
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const renderMarkdown = (content: string) => {
        // Simple markdown renderer
        const lines = content.split("\n");
        const elements: JSX.Element[] = [];
        let key = 0;

        lines.forEach((line) => {
            if (line.startsWith("# ")) {
                elements.push(
                    <h1
                        key={key++}
                        className="text-2xl font-bold text-amber-600 mt-6 mb-4"
                    >
                        {line.replace(/^# /, "")}
                    </h1>
                );
            } else if (line.startsWith("## ")) {
                elements.push(
                    <h2
                        key={key++}
                        className="text-xl font-semibold mt-6 mb-3 flex items-center gap-2"
                    >
                        <div className="w-1.5 h-6 bg-gradient-to-b from-amber-500 to-orange-600 rounded-full" />
                        {line.replace(/^## /, "")}
                    </h2>
                );
            } else if (line.startsWith("### ")) {
                elements.push(
                    <h3 key={key++} className="text-lg font-medium mt-4 mb-2">
                        {line.replace(/^### /, "")}
                    </h3>
                );
            } else if (line.startsWith("- ")) {
                elements.push(
                    <li key={key++} className="ml-4 text-muted-foreground">
                        {line.replace(/^- /, "")}
                    </li>
                );
            } else if (line.startsWith("**") && line.endsWith("**")) {
                elements.push(
                    <p key={key++} className="font-semibold my-2">
                        {line.replace(/\*\*/g, "")}
                    </p>
                );
            } else if (line.trim() === "") {
                elements.push(<br key={key++} />);
            } else {
                elements.push(
                    <p key={key++} className="text-muted-foreground leading-relaxed">
                        {line}
                    </p>
                );
            }
        });

        return elements;
    };

    if (loading) {
        return (
            <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!caseData) {
        return null;
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] py-8 px-4">
            <div className="container mx-auto max-w-4xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <Link href="/dashboard">
                        <Button variant="ghost" className="gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Dashboard
                        </Button>
                    </Link>
                    {caseData.solution && (
                        <PDFExport title={caseData.title} content={caseData.solution} />
                    )}
                </div>

                {/* Case Info Card */}
                <Card className="mb-8 border-amber-500/20 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/25">
                                <Scale className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold mb-2">{caseData.title}</h1>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4" />
                                        {formatDate(caseData.createdAt)}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-green-600">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Solution Generated
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Solution Content */}
                <Card className="bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                                <Scale className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <h2 className="font-semibold">Legal Analysis & Solution</h2>
                                <p className="text-xs text-muted-foreground">
                                    Generated by LawAssist AI
                                </p>
                            </div>
                        </div>
                        <Separator className="mb-6" />
                        <ScrollArea className="max-h-[60vh]">
                            <div className="prose prose-neutral dark:prose-invert max-w-none">
                                {caseData.solution && renderMarkdown(caseData.solution)}
                            </div>
                        </ScrollArea>

                        {/* Disclaimer */}
                        <div className="mt-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                            <p className="text-sm text-amber-700 dark:text-amber-400">
                                <strong>Disclaimer:</strong> This AI-generated content is for
                                informational purposes only and does not constitute legal
                                advice. Please consult with a qualified advocate for specific
                                legal guidance regarding your situation.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
