import { NextResponse } from "next/server";

interface Caption {
  hook: string;
  body: string;
  hashtags: string[];
  cta: string;
  full: string;
}

const TONES: Record<string, string> = {
  funny: "funny with Tunisian humor",
  inspirational: "inspirational and motivational",
  romantic: "romantic and heartfelt",
  savage: "savage and bold",
  aesthetic: "aesthetic and dreamy",
  casual: "casual and chill",
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
      hook: "وجهي قبل 🥴 vs بعد 🤩",
      body: "والله ما كنتش نحلم بهالنتيجة… هذا المنتوج غير كلشي",
      hashtags: ["#قبل_بعد", "#عناية", "#تونس"],
      cta: "جرب و انت تحكم 👇",
      full: "",
    },
    {
      hook: "أمانة عليكم جربوه 😭",
      body: "تستحق كل درهم… النتيجة مبهرة و السعر معقول",
      hashtags: ["#تجربة", "#بيوتي_تونس", "#عناية_بالذات"],
      cta: "الرابط في البايو — توصيل لكل الولايات 🚚",
      full: "",
    },
    {
      hook: "السر اللي ما حكيتوش عليكم 😳",
      body: "هذا المنتوج يخليك تلمعي في كل المناسبات… حتى صاحباتي ما صدقو",
      hashtags: ["#جمال", "#تونسية", "#نصيحة"],
      cta: "عليك الخاص باش تعرف أكثر 🔥",
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
      hook: "الإطلالة تبدأ من الداخل 🌟",
      body: "و المنتوج المناسب يطلع الجمال اللي فيك… ثق في نفسك و في منتوجنا",
      hashtags: ["#تألق", "#عناية", "#تونس"],
      cta: "الطلب عبر الخاص أو الرابط 💫",
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
      hook: "النجاح في التفاصيل 👑",
      body: "و التفاصيل تبدأ باختيار المنتوج المناسب… لأنك تستاهل الأفضل دائماً",
      hashtags: ["#تميز", "#جودة", "#منتج_تونسي"],
      cta: "اطلب الآن — توصيل لكل الولايات 🚚",
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
  romantic: [
    {
      hook: "عشانك أنت و بس 💕",
      body: "هذا المنتوج مهدي لروحك… لأنك تستاهل كل حب و اهتمام",
      hashtags: ["#حب_الذات", "#عناية", "#رومانسية"],
      cta: "دلع نفسك — اطلب الآن ❤️",
      full: "",
    },
    {
      hook: "كيف نحبك… هكا يحبك المنتوج 🌹",
      body: "عناية كاملة و نتيجة تبهر الكل… لأنك قصة حب تستاهل تتحكى",
      hashtags: ["#جمال", "#رومانسية", "#تونس"],
      cta: "الرابط في البايو لحبيبك أو لحبيبتك 💌",
      full: "",
    },
    {
      hook: "أجمل هدية هي العناية 🎀",
      body: "و هذا المنتوج يجمع بين الجمال و الإحساس… هدية روحك قبل الكل",
      hashtags: ["#هدية", "#عناية", "#حب"],
      cta: "اطلب و فرح روحك ❤️",
      full: "",
    },
    {
      hook: "نظرة واحدة تكفي 👀💕",
      body: "من بعد هذا المنتوج… الكل راح يلاحظ الفرق",
      hashtags: ["#جاذبية", "#عناية", "#تونس"],
      cta: "السر في الرابط 🎀",
      full: "",
    },
    {
      hook: "عشق من أول استعمال 💘",
      body: "قلبي قال كلمتو… هذا المنتوج صار جزء من روتيني يوم ما جربتو",
      hashtags: ["#عشق", "#منتج", "#بيوتي"],
      cta: "جرّب و انت تتحقق — الخاص مفتوح 💕",
      full: "",
    },
  ],
  savage: [
    {
      hook: "اللي يحب الجمال يعشق… و اللي ما يحبش يتفرج 🔥",
      body: "نحن هنا باش نخدمونك… جودة ما تلاقيهاش في كل مكان",
      hashtags: ["#جودة", "#ثقة", "#تونس"],
      cta: "الوقت راهو فلوس — اطلب الآن 💪",
      full: "",
    },
    {
      hook: "ما تحسبنيش هاديك اللي خلاها ليه 😏",
      body: "الفرق بينك و بينهم… هذا المنتوج. جرب و شوف",
      hashtags: ["#فرق", "#تميز", "#ستايل"],
      cta: "الخاص أو الرابط — المهم تطلب 💥",
      full: "",
    },
    {
      hook: "نظرات الإعجاب ما تخلصش 👀",
      body: "و المنتوج اللي يخليهم يتفرجو فيك… عندنا. الجودة تتكلم",
      hashtags: ["#جاذبية", "#أناقة", "#تونس"],
      cta: "لا تترددش — الرابط في البايو 🔥",
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
  aesthetic: [
    {
      hook: "تفاصيل صغيرة… فرق كبير 🎀",
      body: "الجمال في البساطة… و هذا المنتوج يجمع الاثنين",
      hashtags: ["#بساطة", "#جمال", "#أناقة"],
      cta: "أضف إلى طلبك الآن ✨",
      full: "",
    },
    {
      hook: "كل مرة نشوفو في المراية… نقولو واو 🌸",
      body: "هذا إحساس يستاهل تعيشو… جودة تحسها في أول استعمال",
      hashtags: ["#ثقة", "#عناية", "#جمال_طبيعي"],
      cta: "الرابط في البايو — توصيل سريع 🕊️",
      full: "",
    },
    {
      hook: "غيمة فسماء صافية ☁️",
      body: "هكا يحسسك هذا المنتوج… خفيف، طبيعي، و يخليك متألقة",
      hashtags: ["#طبيعي", "#نضارة", "#تونس"],
      cta: "جرب الإحساس — اطلب الآن 🌿",
      full: "",
    },
    {
      hook: "الجمال اللي يحكيو عنو 📖",
      body: "هذا المنتوج كتب قصة جديدة لإطلالتك… فصلها الأول يبدأ اليوم",
      hashtags: ["#قصة", "#جمال", "#إطلالة"],
      cta: "اكتب قصتك معانا — الرابط في البايو ✨",
      full: "",
    },
    {
      hook: "قطعة من السماء 🦋",
      body: "هكا وصفتو صاحبتي… رقيقة، جميلة، و تخطف العين",
      hashtags: ["#جمال_أخاذ", "#رقة", "#أنثى"],
      cta: "الرابط في البايو 🎀",
      full: "",
    },
  ],
  casual: [
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
      hook: "صراحة ما كنتش متوقعة هالقد 😅",
      body: "بصراحة، المنتوج راهو فايق… جربتو و حبيتو",
      hashtags: ["#تجربة", "#جودة", "#منتج"],
      cta: "الرابط في البايو — يجيك للمنزل 🏠",
      full: "",
    },
    {
      hook: "باش نطلبو مرة أخرى و نزيدو 🛒",
      body: "من بعد ما جربنا… صرنا نحبو نطلب كل شهر. الإدمان اللي مربح 😄",
      hashtags: ["#إدمان_جمال", "#منتج", "#تونس"],
      cta: "انضم للمجموعة — الرابط في البايو 🌟",
      full: "",
    },
    {
      hook: "جربتو بالأمس و النتيجة 🥹",
      body: "ما نقدرش نوصف… تحسيت براحة و ثقة من أول استعمال",
      hashtags: ["#نتيجة", "#عناية", "#بيوتي_تونس"],
      cta: "جرب و انت تحس — اطلب الآن 💫",
      full: "",
    },
  ],
};

function buildFallbackCaptions(
  topic: string,
  tone: string,
  price: string
): Caption[] {
  const examples = FALLBACKS[tone] || FALLBACKS.casual;
  const tags = makeHashtags(topic);

  return examples.slice(0, 5).map((ex) => {
    const body = price
      ? `${ex.body}\n\nبـ ${price} دينار فقط 🔥`
      : ex.body;
    const allTags = [...new Set([...tags, ...ex.hashtags])].slice(0, 3);
    const full = `${ex.hook}\n\n${body}\n\n${allTags.join(" ")}\n\n${ex.cta}`;
    return { ...ex, body, hashtags: allTags, full };
  });
}

function buildSystemPrompt(
  tone: string,
  lang: string,
  platform: string,
  price: string
): string {
  const toneDesc = TONES[tone] || TONES.casual;
  const platformStyle = PLATFORM_STYLES[platform] || PLATFORM_STYLES.instagram;

  const base = `You write viral ${platform} captions in Tunisian Darija (الدارجة التونسية).
Style: ${platformStyle}
Tone: ${toneDesc}

Each caption MUST:
- Start with a hook (1 line that grabs attention, stops the scroll)
- Follow with 2-4 lines of caption body in Tunisian Darija
- Include 3 relevant hashtags with underscores (e.g. #منتج_تجميل)
- End with a call to action (CTA) like "الرابط في البايو 💌", "عليك الخاص", "اطلب الآن"

Rules:
- The caption is ABOUT the product — make the buyer want it immediately
- Use emojis naturally
- Talk about results, glow-up, confidence, how others will react
- Be relatable and culturally relevant to Tunisia
${price ? `- Naturally mention the price: "بـ ${price} دينار فقط" in the body` : ""}

Return ONLY a JSON array of 5 objects. No markdown, no explanation.
Format:
[
  {
    "hook": "the hook line",
    "body": "the caption body with price if applicable",
    "hashtags": ["#tag1", "#tag2", "#tag3"],
    "cta": "the call to action",
    "full": "hook\\n\\nbody\\n\\nhashtags\\n\\ncta"
  }
]`;

  return base;
}

export async function POST(req: Request) {
  try {
    const {
      topic,
      tone = "casual",
      lang = "darija",
      platform = "instagram",
      price = "",
    } = await req.json();

    if (!topic?.trim()) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    if (process.env.OPENAI_API_KEY) {
      const systemPrompt = buildSystemPrompt(tone, lang, platform, price);
      const userContent = `Product: "${topic}". Platform: ${platform}. Tone: ${tone}.${price ? ` Price: ${price} TND.` : ""}`;

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
        throw new Error("Invalid response format");
      }

      return NextResponse.json({ captions });
    }

    const captions = buildFallbackCaptions(topic, tone, price);
    return NextResponse.json({ captions });
  } catch (err) {
    console.error("Generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate captions" },
      { status: 500 }
    );
  }
}
