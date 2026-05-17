import { NextResponse } from "next/server";

interface Caption {
  hook: string;
  body: string;
  hashtags: string[];
  cta: string;
  full: string;
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

const FALLBACKS: Record<string, Caption[]> = {
  calm: [
    {
      hook: "روتيني اليومي… ما يكملش غير بهذا المنتوج 😌",
      body: "صراحة، جربت برشا منتوجات… و هذا الوحيد اللي حبيتو",
      hashtags: ["#روتين", "#عناية", "#منتج_مفضل"],
      cta: "الخاص مفتوح للاستفسار 💬",
      full: "",
    },
    {
      hook: "طلبي وصل و الفرحة كاملة 🛍️",
      body: "المنتوج كيف ما تمنيت… جودة, رائحة, نتيجة. كل شي تمام",
      hashtags: ["#طلب", "#توصيل", "#تونس"],
      cta: "أنت الي جرب — الرابط تحت 📦",
      full: "",
    },
    {
      hook: "باش نطلبو مرة أخرى و نزيدو 🛒",
      body: "من بعد ما جربنا… صرنا نحبو نطلب كل شهر. الإدمان اللي مربح 😄",
      hashtags: ["#إدمان_جمال", "#منتج", "#تونس"],
      cta: "انضم للمجموعة — الرابط في البايو 🌟",
      full: "",
    },
  ],
  funny: [
    {
      hook: "حتى راجلك يحبك أكثر 😂",
      body: "جربتو هذا المنتوج و لا تندم… راجلي قالي شنو هالغلابة هذي؟ قلتلو سر الجمال 😏",
      hashtags: ["#منتج_تجميل", "#تونس", "#بيوتي"],
      cta: "للطلب دوس على الرابط في البايو 💌",
      full: "",
    },
    {
      hook: "صاحبتك تسألك وين تشري 😏",
      body: "باش تجاوبيها رانا هنا… الجودة و السعر كيف ما تحبي 💅",
      hashtags: ["#منتج_تونسي", "#تجميل", "#بنات_تونس"],
      cta: "الخاص راهو مفتوح تحنا نشري 😎",
      full: "",
    },
    {
      hook: "أمانة عليكم جربوه 😭",
      body: "تستحق كل درهم… النتيجة مبهرة و السعر معقول",
      hashtags: ["#تجربة", "#بيوتي_تونس", "#عناية_بالذات"],
      cta: "الرابط في البايو — توصيل لكل الولايات 🚚",
      full: "",
    },
  ],
  inspirational: [
    {
      hook: "كل نجمة تبدأ بخطوة ✨",
      body: "و أنت تستاهل أفضل نسخة من روحك… ابدأ النهار بالعناية الي ترضيك",
      hashtags: ["#ثقة", "#جمال", "#تونس"],
      cta: "اطلب الآن و حسّن روتينك 👑",
      full: "",
    },
    {
      hook: "غيّر روتينك… غيّر حياتك 🌸",
      body: "أحسن هدية تقدمها لروحك هي العناية… جرب الفرق",
      hashtags: ["#روتين", "#عناية_بالذات", "#تونس"],
      cta: "للحصول عليه دوس على الرابط 🎀",
      full: "",
    },
    {
      hook: "اليوم أول يوم في باقي حياتك 💫",
      body: "قرر تهتم بروحك شويا… النتيجة راح تحسها في كل نظرة",
      hashtags: ["#تطوير_الذات", "#جمال", "#عناية"],
      cta: "ابدأ رحلتك معانا — الرابط في البايو 🌟",
      full: "",
    },
  ],
  strong: [
    {
      hook: "اللي يحب الجمال يعشق… و اللي ما يحبش يتفرج 🔥",
      body: "نحن هنا باش نخدمونك… جودة ما تلاقيهاش في كل مكان",
      hashtags: ["#جودة", "#ثقة", "#تونس"],
      cta: "الوقت راهو فلوس — اطلب الآن 💪",
      full: "",
    },
    {
      hook: "الوقت ما ينتظرش و نحنا ما نستنوش ⏰",
      body: "الكمية محدودة و الطلب يتزايد… اللي يسبق يربح",
      hashtags: ["#عرض", "#كمية_محدودة", "#تسوق"],
      cta: "تصرف الآن قبل ما يخلص 💨",
      full: "",
    },
    {
      hook: "سألوني على سري… قلتهم 🤫",
      body: "اللي يعرفني يعرف أني ما نستعملش غير أفضل المنتوجات… و هذا هو",
      hashtags: ["#سر_الجمال", "#بيوتي", "#تونس"],
      cta: "عليك الخاص نحكيو أكثر 😏",
      full: "",
    },
  ],
};

function buildFallbackCaptions(
  topic: string,
  tone: string,
  price: string,
  link?: string,
): Caption[] {
  const examples = FALLBACKS[tone] || FALLBACKS.calm;
  const tags = makeHashtags(topic);

  return examples.slice(0, 3).map((ex) => {
    const body = price
      ? `${ex.body}\n\nبـ ${price} دينار فقط 🔥`
      : ex.body;
    const allTags = [...new Set([...tags, ...ex.hashtags])].slice(0, 3);
    const cta = link ? `اطلب دابا 👇 ${link}` : ex.cta;
    const full = `${ex.hook}\n\n${body}\n\n${allTags.join(" ")}\n\n${cta}`;
    return { ...ex, body, hashtags: allTags, cta, full };
  });
}

const BRAND_TONE_MAP: Record<string, string> = {
  funny_close: "funny, close, friendly, like a friend talking to friends — use Darija slang naturally",
  elegant_refined: "elegant, refined, classy, premium — respectful and polished language",
  direct_clear: "direct, clear, straightforward — get to the point, focus on value and urgency",
};

function buildSystemPrompt(
  tone: string,
  platform: string,
  price: string,
  link?: string,
  brand?: { niche: string; audience: string; brandTone: string; usp: string },
): string {
  const toneDesc = TONES[tone] || TONES.calm;
  const platformStyle = PLATFORM_STYLES[platform] || PLATFORM_STYLES.instagram;

  let brandSection = "";
  if (brand) {
    const brandToneDesc = BRAND_TONE_MAP[brand.brandTone] || "";
    brandSection = `
SELLER BRAND PROFILE (write captions that match this identity):
- Niche: ${brand.niche}
- Target audience: ${brand.audience || "Not specified"}
- Brand voice: ${brandToneDesc}
- Unique selling point: ${brand.usp || "Not specified"}

The caption must feel like it comes from THIS specific seller. Mirror their brand voice. Mention the USP naturally if relevant.`;
  }

  const base = `You write viral ${platform} captions in Tunisian Darija (الدارجة التونسية).
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

  return base;
}

export async function POST(req: Request) {
  try {
    const {
      topic,
      tone = "calm",
      platform = "instagram",
      price = "",
      link,
      brand,
    } = await req.json();

    if (!topic?.trim()) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    if (process.env.OPENAI_API_KEY) {
      const systemPrompt = buildSystemPrompt(tone, platform, price, link, brand);
      const userContent = `Product: "${topic}". Platform: ${platform}. Tone: ${tone}.${price ? ` Price: ${price} TND.` : ""}${link ? ` Link: ${link}.` : ""}${brand ? ` Brand niche: ${brand.niche}.` : ""}`;

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
        return NextResponse.json(
          { error: "AI service unavailable" },
          { status: 502 }
        );
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || "[]";
      const cleaned = content
        .replace(/```json\s*/gi, "")
        .replace(/```\s*$/g, "")
        .trim();
      const captions: Caption[] = JSON.parse(cleaned);

      if (!Array.isArray(captions)) {
        return NextResponse.json({ error: "Invalid response format" }, { status: 500 });
      }

      return NextResponse.json({ captions });
    }

    const captions = buildFallbackCaptions(topic, tone, price, link);
    return NextResponse.json({ captions });
  } catch (err) {
    console.error("Generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate captions" },
      { status: 500 }
    );
  }
}
