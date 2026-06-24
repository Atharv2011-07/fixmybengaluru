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
