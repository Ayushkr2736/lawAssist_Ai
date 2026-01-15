import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/mongodb";
import Case from "@/models/Case";
import Message from "@/models/Message";
import User from "@/models/User";
import { createCaseSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const validation = createCaseSchema.safeParse(body);

        if (!validation.success) {
            const firstIssue = validation.error.issues[0];
            return NextResponse.json(
                { error: firstIssue?.message || "Validation failed" },
                { status: 400 }
            );
        }

        const { title, initialMessage } = validation.data;

        await dbConnect();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Create the case
        const newCase = await Case.create({
            title,
            userId: user._id,
            status: "active",
        });

        // Create the initial user message
        await Message.create({
            caseId: newCase._id,
            role: "user",
            content: initialMessage,
        });

        return NextResponse.json({
            success: true,
            caseId: newCase._id.toString(),
        });
    } catch (error) {
        console.error("Error creating case:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
