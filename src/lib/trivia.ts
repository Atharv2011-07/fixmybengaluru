export type TriviaQuestion = {
  q: string;
  options: string[];
  answer: number; // index into options
};

// A rotating bank of Bengaluru trivia. A deterministic daily set is picked from this.
export const TRIVIA_BANK: TriviaQuestion[] = [
  { q: "What is Bengaluru popularly known as?", options: ["Garden City", "Pink City", "City of Lakes", "Blue City"], answer: 0 },
  { q: "Which IT hub is located in the east of Bengaluru?", options: ["Whitefield", "Jayanagar", "Malleshwaram", "Basavanagudi"], answer: 0 },
  { q: "Bengaluru is the capital of which state?", options: ["Kerala", "Tamil Nadu", "Karnataka", "Telangana"], answer: 2 },
  { q: "Which famous park is in the heart of Bengaluru?", options: ["Cubbon Park", "Lodhi Garden", "Lalbagh", "Hanging Gardens"], answer: 0 },
  { q: "Lalbagh is famous for its annual show of what?", options: ["Cars", "Flowers", "Books", "Films"], answer: 1 },
  { q: "Who founded the city of Bengaluru in 1537?", options: ["Tipu Sultan", "Kempe Gowda", "Krishnadevaraya", "Hyder Ali"], answer: 1 },
  { q: "Which language is most widely spoken in Bengaluru?", options: ["Tamil", "Telugu", "Kannada", "Hindi"], answer: 2 },
  { q: "Bengaluru is often called India's...?", options: ["Silicon Valley", "Steel City", "Diamond City", "Textile City"], answer: 0 },
  { q: "What is the name of Bengaluru's international airport?", options: ["Kempegowda Intl", "Indira Gandhi Intl", "Chhatrapati Shivaji", "Rajiv Gandhi Intl"], answer: 0 },
  { q: "Which historic fort is located in Bengaluru?", options: ["Golconda Fort", "Bangalore Fort", "Red Fort", "Mehrangarh"], answer: 1 },
  { q: "Vidhana Soudha houses what?", options: ["A museum", "The state legislature", "A railway station", "A stadium"], answer: 1 },
  { q: "Which metro system serves Bengaluru?", options: ["Namma Metro", "Aqua Line", "DMRC", "Chennai Metro"], answer: 0 },
  { q: "Bengaluru sits on which plateau?", options: ["Deccan Plateau", "Chota Nagpur", "Malwa", "Tibetan"], answer: 0 },
  { q: "Which lake in Bengaluru is well known but heavily polluted?", options: ["Bellandur Lake", "Dal Lake", "Chilika", "Vembanad"], answer: 0 },
  { q: "MG Road is a famous street for what?", options: ["Shopping", "Farming", "Mining", "Fishing"], answer: 0 },
  { q: "Which beer brand originated in Bengaluru?", options: ["Kingfisher", "Bira", "Tuborg", "Corona"], answer: 0 },
  { q: "Bengaluru's pleasant weather is due to its high...?", options: ["Rainfall", "Altitude", "Humidity", "Latitude"], answer: 1 },
  { q: "ISRO's headquarters is located in which city?", options: ["Mumbai", "Bengaluru", "Hyderabad", "Pune"], answer: 1 },
  { q: "Which dosa is a Bengaluru breakfast staple?", options: ["Masala Dosa", "Paper Dosa", "Set Dosa", "All of these"], answer: 3 },
  { q: "Tipu Sultan's Summer Palace is made mostly of what?", options: ["Marble", "Teak wood", "Granite", "Sandstone"], answer: 1 },
  { q: "What is the name of Bengaluru's iconic cricket stadium?", options: ["Chinnaswamy", "Wankhede", "Eden Gardens", "Chepauk"], answer: 0 },
  { q: "Which area is known as Bengaluru's pub and food district?", options: ["Indiranagar", "Yelahanka", "Hebbal", "Peenya"], answer: 0 },
];

// Deterministic seeded shuffle so everyone gets the same quiz on a given day.
function seedFromDate(dateStr: string): number {
  let h = 0;
  for (let i = 0; i < dateStr.length; i++) h = (h * 31 + dateStr.charCodeAt(i)) >>> 0;
  return h;
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function todayKolkata(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
}

export function getDailyQuiz(dateStr: string, count = 5): TriviaQuestion[] {
  const rand = mulberry32(seedFromDate(dateStr));
  const indices = TRIVIA_BANK.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices.slice(0, count).map((i) => TRIVIA_BANK[i]);
}