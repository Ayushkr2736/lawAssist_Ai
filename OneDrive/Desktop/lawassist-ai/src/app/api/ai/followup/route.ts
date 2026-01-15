import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/mongodb";
import Case from "@/models/Case";
import Message from "@/models/Message";
import User from "@/models/User";
import { followupSchema } from "@/lib/validations";
import { askAI, ChatMessage } from "@/lib/ai";

const SYSTEM_PROMPT = `You are LawAssist AI, an expert legal assistant specializing in Indian law. Your role is to help users understand their legal situations by asking relevant follow-up questions.

Context: You are gathering information about a legal issue in India. Ask ONE clear, specific follow-up question at a time to better understand the situation.

Guidelines:
- Focus on Indian legal context (IPC, CrPC, specific Indian acts, state laws, etc.)
- Ask about relevant details: dates, locations (state/city in India), parties involved, documentation available
- Be empathetic but professional
- Keep questions concise and easy to understand
- If you have enough information (typically after 3-5 questions), respond with: "READY_FOR_SOLUTION"

Important: Only ask ONE question at a time. Do not provide legal advice yet - just gather information.`;

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const validation = followupSchema.safeParse(body);

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

        // Convert messages and call Gemini
        const allMessages: ChatMessage[] = [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages.map((m) => ({
                role: m.role as "user" | "assistant",
                content: m.content,
            })),
        ];

        const aiMessage = await askAI(allMessages);

        // Check if AI is ready for solution
        const isReadyForSolution = aiMessage.includes("READY_FOR_SOLUTION");

        // Save AI message to database
        const savedMessage = await Message.create({
            caseId: caseData._id,
            role: "assistant",
            content: isReadyForSolution
                ? "I have gathered enough information about your legal situation. Let me prepare a comprehensive solution for you."
                : aiMessage,
        });

        return NextResponse.json({
            success: true,
            message: {
                id: savedMessage._id.toString(),
                role: savedMessage.role,
                content: savedMessage.content,
                createdAt: savedMessage.get("createdAt"),
            },
            readyForSolution: isReadyForSolution,
        });
    } catch (error) {
        console.error("Error getting followup:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
