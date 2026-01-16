import Link from "next/link";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import {
  Scale,
  MessageSquare,
  FileText,
  Shield,
  ArrowRight,
  Sparkles,
  CheckCircle,
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Interactive Consultation",
    description:
      "Chat with our AI to describe your legal situation. We ask smart follow-up questions to understand your case better.",
  },
  {
    icon: Scale,
    title: "Indian Law Expertise",
    description:
      "Specialized in Indian legal framework including IPC, CrPC, civil law, property law, and more.",
  },
  {
    icon: FileText,
    title: "Detailed Solutions",
    description:
      "Receive comprehensive legal analysis with applicable laws, recommended actions, and required documents.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description:
      "Your conversations are securely stored and never shared. Access your case history anytime.",
  },
];

const steps = [
  {
    number: "01",
    title: "Sign In",
    description: "Quick and secure login with your Google account",
  },
  {
    number: "02",
    title: "Describe Your Issue",
    description: "Tell us about your legal situation in simple terms",
  },
  {
    number: "03",
    title: "Answer Questions",
    description: "Respond to AI follow-ups for better understanding",
  },
  {
    number: "04",
    title: "Get Your Solution",
    description: "Receive detailed legal guidance & export as PDF",
  },
];

export default function LandingPage() {
  return (
    <main style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h1>LawAssist AI - Deployment Test</h1>
      <p>If you can see this, the root route (/) is working correctly.</p>
      <p>Next step: Restore original page content and check for crashing components.</p>
    </main>
  );
}
