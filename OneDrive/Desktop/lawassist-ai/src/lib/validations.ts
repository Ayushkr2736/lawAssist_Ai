import { z } from "zod";

export const createCaseSchema = z.object({
    title: z.string().min(1, "Title is required").max(200),
    initialMessage: z.string().min(10, "Please describe your legal issue in at least 10 characters"),
});

export const sendMessageSchema = z.object({
    content: z.string().min(1, "Message cannot be empty"),
});

export const followupSchema = z.object({
    caseId: z.string().min(1, "Case ID is required"),
    messages: z.array(
        z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
        })
    ),
});

export const solutionSchema = z.object({
    caseId: z.string().min(1, "Case ID is required"),
    messages: z.array(
        z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
        })
    ),
});

export type CreateCaseInput = z.infer<typeof createCaseSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type FollowupInput = z.infer<typeof followupSchema>;
export type SolutionInput = z.infer<typeof solutionSchema>;
