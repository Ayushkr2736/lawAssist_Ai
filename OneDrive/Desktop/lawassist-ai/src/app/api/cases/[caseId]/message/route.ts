import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/mongodb";
import Case from "@/models/Case";
import Message from "@/models/Message";
import User from "@/models/User";
import { sendMessageSchema } from "@/lib/validations";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ caseId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { caseId } = await params;
        const body = await request.json();
        const validation = sendMessageSchema.safeParse(body);

        if (!validation.success) {
            const firstIssue = validation.error.issues[0];
            return NextResponse.json(
                { error: firstIssue?.message || "Validation failed" },
                { status: 400 }
            );
        }

        const { content } = validation.data;

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

        if (caseData.status === "completed") {
            return NextResponse.json(
                { error: "Cannot add messages to a completed case" },
                { status: 400 }
            );
        }

        const message = await Message.create({
            caseId: caseData._id,
            role: "user",
            content,
        });

        return NextResponse.json({
            success: true,
            message: {
                id: message._id.toString(),
                role: message.role,
                content: message.content,
                createdAt: message.get("createdAt"),
            },
        });
    } catch (error) {
        console.error("Error adding message:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
