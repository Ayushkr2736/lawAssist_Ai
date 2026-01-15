import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/mongodb";
import Case from "@/models/Case";
import User from "@/models/User";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const cases = await Case.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .select("title status createdAt updatedAt")
            .lean();

        return NextResponse.json({
            success: true,
            cases: cases.map((c) => ({
                id: c._id.toString(),
                title: c.title,
                status: c.status,
                createdAt: c.createdAt,
                updatedAt: c.updatedAt,
            })),
        });
    } catch (error) {
        console.error("Error listing cases:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
