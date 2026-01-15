import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/mongodb";
import Case from "@/models/Case";
import Message from "@/models/Message";
import User from "@/models/User";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ caseId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { caseId } = await params;

        await dbConnect();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const caseData = await Case.findOne({
            _id: caseId,
            userId: user._id,
        }).lean();

        if (!caseData) {
            return NextResponse.json({ error: "Case not found" }, { status: 404 });
        }

        const messages = await Message.find({ caseId: caseData._id })
            .sort({ createdAt: 1 })
            .lean();

        return NextResponse.json({
            success: true,
            case: {
                id: caseData._id.toString(),
                title: caseData.title,
                status: caseData.status,
                solution: caseData.solution,
                createdAt: caseData.createdAt,
                updatedAt: caseData.updatedAt,
            },
            messages: messages.map((m) => ({
                id: m._id.toString(),
                role: m.role,
                content: m.content,
                createdAt: m.createdAt,
            })),
        });
    } catch (error) {
        console.error("Error getting case:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
