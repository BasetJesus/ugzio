import json
import os
from typing import Optional

from openai import OpenAI

FALLBACKS = {
    "calm": [
        {
            "hook": "روتيني اليومي… ما يكملش غير بهذا المنتوج 😌",
            "body": "صراحة، جربت برشا منتوجات… و هذا الوحيد اللي حبيتو",
            "hashtags": ["#روتين", "#عناية", "#منتج_مفضل"],
            "cta": "الخاص مفتوح للاستفسار 💬",
            "full": "",
        },
        {
            "hook": "طلبي وصل و الفرحة كاملة 🛍️",
            "body": "المنتوج كيف ما تمنيت… جودة, رائحة, نتيجة. كل شي تمام",
            "hashtags": ["#طلب", "#توصيل", "#تونس"],
            "cta": "أنت الي جرب — الرابط تحت 📦",
            "full": "",
        },
        {
            "hook": "باش نطلبو مرة أخرى و نزيدو 🛒",
            "body": "من بعد ما جربنا… صرنا نحبو نطلب كل شهر. الإدمان اللي مربح 😄",
            "hashtags": ["#إدمان_جمال", "#منتج", "#تونس"],
            "cta": "انضم للمجموعة — الرابط في البايو 🌟",
            "full": "",
        },
    ],
    "funny": [
        {
            "hook": "حتى راجلك يحبك أكثر 😂",
            "body": "جربتو هذا المنتوج و لا تندم… راجلي قالي شنو هالغلابة هذي؟ قلتلو سر الجمال 😏",
            "hashtags": ["#منتج_تجميل", "#تونس", "#بيوتي"],
            "cta": "للطلب دوس على الرابط في البايو 💌",
            "full": "",
        },
        {
            "hook": "صاحبتك تسألك وين تشري 😏",
            "body": "باش تجاوبيها رانا هنا… الجودة و السعر كيف ما تحبي 💅",
            "hashtags": ["#منتج_تونسي", "#تجميل", "#بنات_تونس"],
            "cta": "الخاص راهو مفتوح تحنا نشري 😎",
            "full": "",
        },
        {
            "hook": "أمانة عليكم جربوه 😭",
            "body": "تستحق كل درهم… النتيجة مبهرة و السعر معقول",
            "hashtags": ["#تجربة", "#بيوتي_تونس", "#عناية_بالذات"],
            "cta": "الرابط في البايو — توصيل لكل الولايات 🚚",
            "full": "",
        },
    ],
    "inspirational": [
        {
            "hook": "كل نجمة تبدأ بخطوة ✨",
            "body": "و أنت تستاهل أفضل نسخة من روحك… ابدأ النهار بالعناية الي ترضيك",
            "hashtags": ["#ثقة", "#جمال", "#تونس"],
            "cta": "اطلب الآن و حسّن روتينك 👑",
            "full": "",
        },
        {
            "hook": "غيّر روتينك… غيّر حياتك 🌸",
            "body": "أحسن هدية تقدمها لروحك هي العناية… جرب الفرق",
            "hashtags": ["#روتين", "#عناية_بالذات", "#تونس"],
            "cta": "للحصول عليه دوس على الرابط 🎀",
            "full": "",
        },
        {
            "hook": "اليوم أول يوم في باقي حياتك 💫",
            "body": "قرر تهتم بروحك شويا… النتيجة راح تحسها في كل نظرة",
            "hashtags": ["#تطوير_الذات", "#جمال", "#عناية"],
            "cta": "ابدأ رحلتك معانا — الرابط في البايو 🌟",
            "full": "",
        },
    ],
    "strong": [
        {
            "hook": "اللي يحب الجمال يعشق… و اللي ما يحبش يتفرج 🔥",
            "body": "نحن هنا باش نخدمونك… جودة ما تلاقيهاش في كل مكان",
            "hashtags": ["#جودة", "#ثقة", "#تونس"],
            "cta": "الوقت راهو فلوس — اطلب الآن 💪",
            "full": "",
        },
        {
            "hook": "الوقت ما ينتظرش و نحنا ما نستنوش ⏰",
            "body": "الكمية محدودة و الطلب يتزايد… اللي يسبق يربح",
            "hashtags": ["#عرض", "#كمية_محدودة", "#تسوق"],
            "cta": "تصرف الآن قبل ما يخلص 💨",
            "full": "",
        },
        {
            "hook": "سألوني على سري… قلتهم 🤫",
            "body": "اللي يعرفني يعرف أني ما نستعملش غير أفضل المنتوجات… و هذا هو",
            "hashtags": ["#سر_الجمال", "#بيوتي", "#تونس"],
            "cta": "عليك الخاص نحكيو أكثر 😏",
            "full": "",
        },
    ],
}

TONES = {
    "calm": "calm, soft, reassuring, like a friend giving advice",
    "funny": "funny with Tunisian humor",
    "inspirational": "inspirational and motivational",
    "strong": "savage, bold, confident, no-nonsense energy",
}

PLATFORM_STYLES = {
    "tiktok": "short, punchy, trend-aware, max 2-3 lines, use trending audio references if possible",
    "instagram": "storytelling, emotional, aesthetic, 3-5 lines, perfect for feed posts",
    "facebook": "direct, COD-friendly, mention payment options, 4-6 lines, build trust",
}

BRAND_TONE_MAP = {
    "funny_close": "funny, close, friendly, like a friend talking to friends — use Darija slang naturally",
    "elegant_refined": "elegant, refined, classy, premium — respectful and polished language",
    "direct_clear": "direct, clear, straightforward — get to the point, focus on value and urgency",
}


def make_hashtags(topic: str) -> list[str]:
    words = topic.split()
    main = "_".join(words)
    tags = [f"#{main}"]
    if len(words) > 1:
        tags.append(f"#{words[0]}")
        tags.append(f"#{words[-1]}_تونس")
    else:
        tags.append(f"#{words[0]}_تونس")
        tags.append("#منتج")
    return tags


def build_system_prompt(
    tone: str,
    platform: str,
    price: str = "",
    link: Optional[str] = None,
    brand: Optional[dict] = None,
) -> str:
    tone_desc = TONES.get(tone, TONES["calm"])
    platform_style = PLATFORM_STYLES.get(platform, PLATFORM_STYLES["instagram"])

    brand_section = ""
    if brand:
        brand_tone_desc = BRAND_TONE_MAP.get(brand.get("brandTone", ""), "")
        brand_section = f"""
SELLER BRAND PROFILE (write captions that match this identity):
- Niche: {brand.get("niche", "")}
- Target audience: {brand.get("audience", "Not specified")}
- Brand voice: {brand_tone_desc}
- Unique selling point: {brand.get("usp", "Not specified")}

The caption must feel like it comes from THIS specific seller. Mirror their brand voice. Mention the USP naturally if relevant."""

    link_line = f'- End with the CTA: "اطلب دابا 👇 {link}"' if link else '- End with a call to action (CTA) like "الرابط في البايو 💌", "عليك الخاص", "اطلب الآن"'
    price_line = f'- Naturally mention the price: "بـ {price} دينار فقط" in the body' if price else ""

    return f"""You write viral {platform} captions in Tunisian Darija (الدارجة التونسية).
Style: {platform_style}
Tone: {tone_desc}{brand_section}

Each caption MUST:
- Start with a hook (1 line that grabs attention, stops the scroll)
- Follow with 2-4 lines of caption body in Tunisian Darija
- Include 3 relevant hashtags with underscores (e.g. #منتج_تجميل)
{link_line}

Rules:
- The caption is ABOUT the product — make the buyer want it immediately
- Use emojis naturally
- Talk about results, glow-up, confidence, how others will react
- Be relatable and culturally relevant to Tunisia
{price_line}

Return ONLY a JSON array of 3 objects. No markdown, no explanation.
Format:
[
  {{
    "hook": "the hook line",
    "body": "the caption body with price if applicable",
    "hashtags": ["#tag1", "#tag2", "#tag3"],
    "cta": "the call to action",
    "full": "hook\\n\\nbody\\n\\nhashtags\\n\\ncta"
  }}
]"""


def build_fallback_captions(
    topic: str,
    tone: str,
    price: str = "",
    link: Optional[str] = None,
) -> list[dict]:
    examples = FALLBACKS.get(tone, FALLBACKS["calm"])
    tags = make_hashtags(topic)

    results = []
    for ex in examples[:3]:
        body = f"{ex['body']}\n\nبـ {price} دينار فقط 🔥" if price else ex["body"]
        all_tags = list(dict.fromkeys(tags + ex["hashtags"]))[:3]
        cta = f"اطلب دابا 👇 {link}" if link else ex["cta"]
        full = f"{ex['hook']}\n\n{body}\n\n{' '.join(all_tags)}\n\n{cta}"
        results.append({
            "hook": ex["hook"],
            "body": body,
            "hashtags": all_tags,
            "cta": cta,
            "full": full,
        })
    return results


def generate_captions_with_openai(
    topic: str,
    tone: str = "calm",
    platform: str = "instagram",
    price: str = "",
    link: Optional[str] = None,
    brand: Optional[dict] = None,
) -> list[dict]:
    api_key = os.environ.get("OPENAI_API_KEY", "")
    if not api_key:
        return build_fallback_captions(topic, tone, price, link)

    client = OpenAI(api_key=api_key)
    system_prompt = build_system_prompt(tone, platform, price, link, brand)

    user_content = f'Product: "{topic}". Platform: {platform}. Tone: {tone}.'
    if price:
        user_content += f" Price: {price} TND."
    if link:
        user_content += f" Link: {link}."
    if brand:
        user_content += f" Brand niche: {brand.get('niche', '')}."

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content},
            ],
            temperature=0.8,
            max_tokens=1000,
        )

        content = response.choices[0].message.content or "[]"
        cleaned = content.replace("```json", "").replace("```", "").strip()
        captions = json.loads(cleaned)

        if isinstance(captions, list):
            return captions
        return build_fallback_captions(topic, tone, price, link)
    except Exception:
        return build_fallback_captions(topic, tone, price, link)


def generate_captions(
    topic: str,
    tone: str = "calm",
    platform: str = "instagram",
    price: str = "",
    link: Optional[str] = None,
    brand: Optional[dict] = None,
) -> dict:
    captions = generate_captions_with_openai(topic, tone, platform, price, link, brand)
    return {"captions": captions}
