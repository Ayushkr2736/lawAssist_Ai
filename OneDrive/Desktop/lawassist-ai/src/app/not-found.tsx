import Link from "next/link";
import { MoveLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                404
            </h1>
            <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
            <p className="text-muted-foreground text-center max-w-md mb-8">
                The page you are looking for doesn't exist or has been moved.
            </p>
            <Link href="/">
                <Button className="gap-2">
                    <MoveLeft className="w-4 h-4" />
                    Back to Home
                </Button>
            </Link>
        </div>
    );
}
