import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/mongodb";
import Case from "@/models/Case";
import Message from "@/models/Message";
import User from "@/models/User";
import { solutionSchema } from "@/lib/validations";
import { askAI, ChatMessage } from "@/lib/ai";

const SOLUTION_PROMPT = `You are LawAssist AI, an expert legal assistant specializing in Indian law. Based on the conversation, provide a comprehensive legal analysis and solution.

Structure your response in Markdown with the following sections:

# Legal Analysis & Solution

## Summary of the Issue
Brief overview of the legal situation described.

## Applicable Laws & Regulations
List relevant Indian laws, acts, sections (e.g., IPC sections, specific acts, state laws).

## Legal Analysis
Detailed analysis of the legal aspects of the situation.

## Recommended Actions
Step-by-step recommended actions the person should take.

## Important Deadlines & Timelines
Any relevant limitation periods, filing deadlines, or time-sensitive matters.

## Documents Required
List of documents that may be needed.

## Potential Outcomes
What the person can reasonably expect.

## Disclaimer
Include a standard legal disclaimer that this is general information and not substitute for professional legal advice from a licensed advocate.

Be thorough, professional, and specific to Indian jurisdiction. Reference specific sections of relevant acts when applicable.`;

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const validation = solutionSchema.safeParse(body);

        if (!validation.success) {
            const firstIssue = validation.error.issues[0];
            return NextResponse.json(
                { error: firstIssue?.message || "Validation failed" },
                { status: 400 }
            );
        }

        const { caseId, messages } = validation.data;

        await dbConnect();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const caseData = await Case.findOne({
            _id: caseId,
            userId: user._id,
        });

        if (!caseData) {
            return NextResponse.json({ error: "Case not found" }, { status: 404 });
        }

        // Call Gemini API for solution
        const allMessages: ChatMessage[] = [
            { role: "system", content: SOLUTION_PROMPT },
            ...messages.map((m) => ({
                role: m.role as "user" | "assistant",
                content: m.content,
            })),
        ];

        const solution = await askAI(allMessages);

        // Update case with solution and mark as completed
        caseData.solution = solution;
        caseData.status = "completed";
        await caseData.save();

        // Save the solution as a message too
        await Message.create({
            caseId: caseData._id,
            role: "assistant",
            content: solution,
        });

        return NextResponse.json({
            success: true,
            solution,
        });
    } catch (error) {
        console.error("Error generating solution:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
