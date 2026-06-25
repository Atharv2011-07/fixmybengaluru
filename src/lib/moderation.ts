// Lightweight community chat regulator — masks inappropriate language before a
// message is posted. Catches common profanity, slurs and basic leet variants.
const BAD_WORDS = [
  "fuck", "fuk", "fck", "shit", "sht", "bitch", "bastard", "asshole", "ass",
  "dick", "cock", "pussy", "cunt", "slut", "whore", "fag", "faggot", "nigga",
  "nigger", "retard", "rape", "rapist", "motherfucker", "mofo", "bullshit",
  "bollocks", "wanker", "prick", "twat", "douche", "jerk", "crap", "damn",
  "bsdk", "bsodk", "madarchod", "behenchod", "bhenchod", "chutiya", "chutiye",
  "gandu", "gaand", "lund", "lauda", "randi", "harami", "kutta", "kutte",
  "saala", "sala", "kameena", "bhosdike", "bhosadi",
];

const LEET: Record<string, string> = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", $: "s" };

function normalize(word: string): string {
  return word
    .toLowerCase()
    .split("")
    .map((c) => LEET[c] ?? c)
    .join("")
    .replace(/(.)\1{2,}/g, "$1$1");
}

const BAD_SET = new Set(BAD_WORDS);

export interface ModerationResult {
  clean: string;
  flagged: boolean;
  count: number;
}

export function moderateMessage(input: string): ModerationResult {
  let count = 0;
  const clean = input.replace(/[\p{L}\p{N}@$]+/gu, (token) => {
    const norm = normalize(token).replace(/[^a-z]/g, "");
    const hit = BAD_SET.has(norm) || BAD_WORDS.some((w) => w.length > 3 && norm.includes(w));
    if (hit) {
      count++;
      return token[0] + "*".repeat(Math.max(token.length - 1, 1));
    }
    return token;
  });
  return { clean, flagged: count > 0, count };
}

// Detects keyboard-mashing / random gibberish so people can't submit junk
// descriptions. Returns a human-readable reason when the text looks invalid.
export function validateDescription(input: string): { ok: boolean; reason?: string } {
  const text = input.trim();
  if (text.length < 10) return { ok: false, reason: "Add a short description (min 10 chars)." };

  const words = text.split(/\s+/).filter(Boolean);
  if (words.length < 3) return { ok: false, reason: "Please write at least 3 words describing the issue." };

  const letters = text.replace(/[^a-zA-Z]/g, "");
  if (letters.length < 8) return { ok: false, reason: "Description must contain real words." };

  // Most real words contain a vowel — flag text where almost none do.
  const realWords = words.filter((w) => /[a-zA-Z]/.test(w));
  const vowelWords = realWords.filter((w) => /[aeiou]/i.test(w));
  if (realWords.length >= 3 && vowelWords.length / realWords.length < 0.5) {
    return { ok: false, reason: "This doesn't look like a real description. Please describe the pothole." };
  }

  // Flag long runs of the same character or no vowels at all (keyboard mashing).
  const vowelRatio = (letters.match(/[aeiou]/gi)?.length ?? 0) / letters.length;
  if (vowelRatio < 0.18) {
    return { ok: false, reason: "This doesn't look like a real description. Please describe the pothole." };
  }
  if (/(.)\1{4,}/.test(text)) {
    return { ok: false, reason: "Please remove repeated characters and describe the pothole." };
  }

  return { ok: true };
}
