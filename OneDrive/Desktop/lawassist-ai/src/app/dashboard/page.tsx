"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import CaseCard from "@/components/CaseCard";
import { Plus, FileText, Loader2 } from "lucide-react";

interface Case {
    id: string;
    title: string;
    status: "active" | "completed";
    createdAt: string;
}

export default function DashboardPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [cases, setCases] = useState<Case[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewCase, setShowNewCase] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchCases();
    }, []);

    const fetchCases = async () => {
        try {
            const response = await fetch("/api/cases/list");
            const data = await response.json();
            if (data.success) {
                setCases(data.cases);
            }
        } catch (error) {
            console.error("Error fetching cases:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCase = async () => {
        if (!title.trim() || !description.trim()) return;

        setCreating(true);
        try {
            const response = await fetch("/api/cases/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: title.trim(),
                    initialMessage: description.trim(),
                }),
            });

            const data = await response.json();
            if (data.success) {
                router.push(`/dashboard/case/${data.caseId}`);
            } else {
                alert(data.error || "Failed to create case");
            }
        } catch (error) {
            console.error("Error creating case:", error);
            alert("Failed to create case");
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="container mx-auto max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">
                        Welcome back, {session?.user?.name?.split(" ")[0] || "User"}!
                    </h1>
                    <p className="text-muted-foreground">
                        Start a new legal consultation or continue with existing cases.
                    </p>
                </div>

                {/* New Case Button / Form */}
                {!showNewCase ? (
                    <Button
                        onClick={() => setShowNewCase(true)}
                        className="w-full h-14 mb-8 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/25 text-lg"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Start New Case
                    </Button>
                ) : (
                    <Card className="mb-8 border-amber-500/20 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-white" />
                                </div>
                                Start New Legal Consultation
                            </CardTitle>
                            <CardDescription>
                                Describe your legal issue and our AI will guide you through the
                                process
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Case Title
                                </label>
                                <Input
                                    placeholder="e.g., Property Dispute with Neighbor"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="h-12"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Describe Your Legal Issue
                                </label>
                                <Textarea
                                    placeholder="Explain your legal situation in detail. Include relevant facts, dates, and any actions you've already taken..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    className="resize-none"
                                />
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    onClick={handleCreateCase}
                                    disabled={!title.trim() || !description.trim() || creating}
                                    className="flex-1 h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                                >
                                    {creating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Starting...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Start Consultation
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowNewCase(false);
                                        setTitle("");
                                        setDescription("");
                                    }}
                                    className="h-12 px-6"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Case History */}
                <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-amber-600" />
                        Your Cases
                    </h2>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="h-24 rounded-xl bg-muted animate-pulse"
                                />
                            ))}
                        </div>
                    ) : cases.length === 0 ? (
                        <Card className="border-dashed border-2 bg-muted/30">
                            <CardContent className="py-12 text-center">
                                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                                    <FileText className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-medium mb-2">No cases yet</h3>
                                <p className="text-muted-foreground">
                                    Start your first legal consultation by clicking the button
                                    above.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {cases.map((caseItem) => (
                                <CaseCard
                                    key={caseItem.id}
                                    id={caseItem.id}
                                    title={caseItem.title}
                                    status={caseItem.status}
                                    createdAt={caseItem.createdAt}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
