import { prisma } from "@/lib/db";

interface CaptionResult {
  hook: string;
  body: string;
  hashtags: string[];
  cta: string;
  full: string;
}

interface BrandProfile {
  niche?: string;
  audience?: string;
  brandTone?: "funny_close" | "elegant_refined" | "direct_clear";
  usp?: string;
}

const TONES: Record<string, string> = {
  calm: "calm, soft, reassuring, like a friend giving advice",
  funny: "funny with Tunisian humor",
  inspirational: "inspirational and motivational",
  strong: "savage, bold, confident, no-nonsense energy",
};

const PLATFORM_STYLES: Record<string, string> = {
  tiktok: "short, punchy, trend-aware, max 2-3 lines, use trending audio references if possible",
  instagram: "storytelling, emotional, aesthetic, 3-5 lines, perfect for feed posts",
  facebook: "direct, COD-friendly, mention payment options, 4-6 lines, build trust",
};

const BRAND_TONE_MAP: Record<string, string> = {
  funny_close: "funny, close, friendly, like a friend talking to friends — use Darija slang naturally",
  elegant_refined: "elegant, refined, classy, premium — respectful and polished language",
  direct_clear: "direct, clear, straightforward — get to the point, focus on value and urgency",
};

const FALLBACKS: Record<string, CaptionResult[]> = {
  calm: [
    { hook: "روتيني اليومي… ما يكملش غير بهذا المنتوج 😌", body: "صراحة، جربت برشا منتوجات… و هذا الوحيد اللي حبيتو", hashtags: ["#روتين", "#عناية", "#منتج_مفضل"], cta: "الخاص مفتوح للاستفسار 💬", full: "" },
    { hook: "طلبي وصل و الفرحة كاملة 🛍️", body: "المنتوج كيف ما تمنيت… جودة, رائحة, نتيجة. كل شي تمام", hashtags: ["#طلب", "#توصيل", "#تونس"], cta: "أنت الي جرب — الرابط تحت 📦", full: "" },
    { hook: "باش نطلبو مرة أخرى و نزيدو 🛒", body: "من بعد ما جربنا… صرنا نحبو نطلب كل شهر. الإدمان اللي مربح 😄", hashtags: ["#إدمان_جمال", "#منتج", "#تونس"], cta: "انضم للمجموعة — الرابط في البايو 🌟", full: "" },
  ],
  funny: [
    { hook: "حتى راجلك يحبك أكثر 😂", body: "جربتو هذا المنتوج و لا تندم… راجلي قالي شنو هالغلابة هذي؟ قلتلو سر الجمال 😏", hashtags: ["#منتج_تجميل", "#تونس", "#بيوتي"], cta: "للطلب دوس على الرابط في البايو 💌", full: "" },
    { hook: "صاحبتك تسألك وين تشري 😏", body: "باش تجاوبيها رانا هنا… الجودة و السعر كيف ما تحبي 💅", hashtags: ["#منتج_تونسي", "#تجميل", "#بنات_تونس"], cta: "الخاص راهو مفتوح تحنا نشري 😎", full: "" },
    { hook: "أمانة عليكم جربوه 😭", body: "تستحق كل درهم… النتيجة مبهرة و السعر معقول", hashtags: ["#تجربة", "#بيوتي_تونس", "#عناية_بالذات"], cta: "الرابط في البايو — توصيل لكل الولايات 🚚", full: "" },
  ],
  inspirational: [
    { hook: "كل نجمة تبدأ بخطوة ✨", body: "و أنت تستاهل أفضل نسخة من روحك… ابدأ النهار بالعناية الي ترضيك", hashtags: ["#ثقة", "#جمال", "#تونس"], cta: "اطلب الآن و حسّن روتينك 👑", full: "" },
    { hook: "غيّر روتينك… غيّر حياتك 🌸", body: "أحسن هدية تقدمها لروحك هي العناية… جرب الفرق", hashtags: ["#روتين", "#عناية_بالذات", "#تونس"], cta: "للحصول عليه دوس على الرابط 🎀", full: "" },
    { hook: "اليوم أول يوم في باقي حياتك 💫", body: "قرر تهتم بروحك شويا… النتيجة راح تحسها في كل نظرة", hashtags: ["#تطوير_الذات", "#جمال", "#عناية"], cta: "ابدأ رحلتك معانا — الرابط في البايو 🌟", full: "" },
  ],
  strong: [
    { hook: "اللي يحب الجمال يعشق… و اللي ما يحبش يتفرج 🔥", body: "نحن هنا باش نخدمونك… جودة ما تلاقيهاش في كل مكان", hashtags: ["#جودة", "#ثقة", "#تونس"], cta: "الوقت راهو فلوس — اطلب الآن 💪", full: "" },
    { hook: "الوقت ما ينتظرش و نحنا ما نستنوش ⏰", body: "الكمية محدودة و الطلب يتزايد… اللي يسبق يربح", hashtags: ["#عرض", "#كمية_محدودة", "#تسوق"], cta: "تصرف الآن قبل ما يخلص 💨", full: "" },
    { hook: "سألوني على سري… قلتهم 🤫", body: "اللي يعرفني يعرف أني ما نستعملش غير أفضل المنتوجات… و هذا هو", hashtags: ["#سر_الجمال", "#بيوتي", "#تونس"], cta: "عليك الخاص نحكيو أكثر 😏", full: "" },
  ],
};

function makeHashtags(topic: string): string[] {
  const words = topic.split(/\s+/);
  const main = words.join("_");
  const tags = [`#${main}`];
  if (words.length > 1) {
    tags.push(`#${words[0]}`);
    tags.push(`#${words[words.length - 1]}_تونس`);
  } else {
    tags.push(`#${words[0]}_تونس`);
    tags.push(`#منتج`);
  }
  return tags;
}

function buildSystemPrompt(tone: string, platform: string, price: string, link?: string, brand?: BrandProfile): string {
  const toneDesc = TONES[tone] || TONES.calm;
  const platformStyle = PLATFORM_STYLES[platform] || PLATFORM_STYLES.instagram;

  let brandSection = "";
  if (brand) {
    const brandToneDesc = BRAND_TONE_MAP[brand.brandTone || ""] || "";
    brandSection = `
SELLER BRAND PROFILE (write captions that match this identity):
- Niche: ${brand.niche}
- Target audience: ${brand.audience || "Not specified"}
- Brand voice: ${brandToneDesc}
- Unique selling point: ${brand.usp || "Not specified"}

The caption must feel like it comes from THIS specific seller. Mirror their brand voice. Mention the USP naturally if relevant.`;
  }

  return `You write viral ${platform} captions in Tunisian Darija (الدارجة التونسية).
Style: ${platformStyle}
Tone: ${toneDesc}${brandSection}

Each caption MUST:
- Start with a hook (1 line that grabs attention, stops the scroll)
- Follow with 2-4 lines of caption body in Tunisian Darija
- Include 3 relevant hashtags with underscores (e.g. #منتج_تجميل)
${link ? `- End with the CTA: "اطلب دابا 👇 ${link}"` : '- End with a call to action (CTA) like "الرابط في البايو 💌", "عليك الخاص", "اطلب الآن"'}
Rules:
- The caption is ABOUT the product — make the buyer want it immediately
- Use emojis naturally
- Talk about results, glow-up, confidence, how others will react
- Be relatable and culturally relevant to Tunisia
${price ? `- Naturally mention the price: "بـ ${price} دينار فقط" in the body` : ""}
Return ONLY a JSON array of 3 objects. No markdown, no explanation.
Format:
[
  {
    "hook": "the hook line",
    "body": "the caption body with price if applicable",
    "hashtags": ["#tag1", "#tag2", "#tag3"],
    "cta": "the call to action${link ? `, must be exactly: "اطلب دابا 👇 ${link}"` : ""}",
    "full": "hook\\n\\nbody\\n\\nhashtags\\n\\ncta"
  }
]`;
}

function buildFallbackCaptions(topic: string, tone: string, price: string, link?: string): CaptionResult[] {
  const examples = FALLBACKS[tone] || FALLBACKS.calm;
  const tags = makeHashtags(topic);
  return examples.slice(0, 3).map((ex) => {
    const body = price ? `${ex.body}\n\nبـ ${price} دينار فقط 🔥` : ex.body;
    const allTags = [...new Set([...tags, ...ex.hashtags])].slice(0, 3);
    const cta = link ? `اطلب دابا 👇 ${link}` : ex.cta;
    return { ...ex, body, hashtags: allTags, cta, full: `${ex.hook}\n\n${body}\n\n${allTags.join(" ")}\n\n${cta}` };
  });
}

export async function getOrgCaptionProfile(orgId: string): Promise<BrandProfile | null> {
  try {
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { captionProfile: true },
    });
    if (!org?.captionProfile) return null;
    return JSON.parse(org.captionProfile) as BrandProfile;
  } catch {
    return null;
  }
}

export async function updateOrgCaptionProfile(orgId: string, profile: BrandProfile): Promise<{ success: boolean }> {
  try {
    await prisma.organization.update({
      where: { id: orgId },
      data: { captionProfile: JSON.stringify(profile) },
    });
    return { success: true };
  } catch {
    return { success: false };
  }
}

async function callZioBrain(opts: {
  topic: string; tone: string; platform: string; price: string; link?: string; brand?: BrandProfile;
}): Promise<CaptionResult[] | null> {
  const url = process.env.ZIOBRAIN_URL || process.env.PYTHON_SERVICE_URL;
  if (!url) return null;
  try {
    const res = await fetch(`${url}/brain/captions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: opts.topic,
        tone: opts.tone,
        platform: opts.platform,
        price: opts.price,
        link: opts.link || undefined,
        brand: opts.brand || undefined,
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data.captions)) return data.captions as CaptionResult[];
    return null;
  } catch {
    return null;
  }
}

async function callOpenAI(opts: {
  topic: string; tone: string; platform: string; price: string; link?: string; brand?: BrandProfile;
}): Promise<CaptionResult[] | null> {
  if (!process.env.OPENAI_API_KEY) return null;
  try {
    const systemPrompt = buildSystemPrompt(opts.tone, opts.platform, opts.price, opts.link, opts.brand);
    const userContent = `Product: "${opts.topic}". Platform: ${opts.platform}. Tone: ${opts.tone}.${opts.price ? ` Price: ${opts.price} TND.` : ""}${opts.link ? ` Link: ${opts.link}.` : ""}${opts.brand?.niche ? ` Brand niche: ${opts.brand.niche}.` : ""}`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("OpenAI API error:", err);
      return null;
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "[]";
    const cleaned = content.replace(/```json\s*/gi, "").replace(/```\s*$/g, "").trim();
    const captions: CaptionResult[] = JSON.parse(cleaned);

    if (!Array.isArray(captions)) return null;
    return captions;
  } catch {
    return null;
  }
}

export async function generateCaptions(opts: {
  topic: string;
  tone: string;
  platform: string;
  price: string;
  link?: string;
  brand?: BrandProfile;
}): Promise<{ captions: CaptionResult[] }> {
  const fromBrain = await callZioBrain(opts);
  if (fromBrain) return { captions: fromBrain };

  const fromOpenAI = await callOpenAI(opts);
  if (fromOpenAI) return { captions: fromOpenAI };

  const captions = buildFallbackCaptions(opts.topic, opts.tone, opts.price, opts.link);
  return { captions };
}
