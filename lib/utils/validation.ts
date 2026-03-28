import { TOPIC_IDS } from "@/lib/constants/topics";

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validateTopic(topic: string): boolean {
  return (TOPIC_IDS as readonly string[]).includes(topic);
}

export function sanitizeInput(text: string): string {
  return text
    .replace(/[<>]/g, "")
    .replace(/&/g, "&amp;")
    .trim()
    .slice(0, 1000);
}
