export const ADMIN_GREETINGS = [
  "Let's sell some skincare today.",
  "Time to help some skin glow.",
  "Let's beat some skin issues today.",
  "Ready to make someone's skin happier?",
  "Another day, another glow-up to deliver.",
  "Let's keep Our client's skin hydrated today.",
  "Your customers are waiting for that glow.",
  "Small wins today, glowing skin tomorrow.",
]

export function getRandomGreeting() {
  return ADMIN_GREETINGS[Math.floor(Math.random() * ADMIN_GREETINGS.length)]
}