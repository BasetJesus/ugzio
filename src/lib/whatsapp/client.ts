const API_VERSION = "v22.0";

function getBaseUrl() {
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID;
  if (!phoneNumberId) throw new Error("META_PHONE_NUMBER_ID not set");
  return `https://graph.facebook.com/${API_VERSION}/${phoneNumberId}/messages`;
}

function getHeaders() {
  const token = process.env.META_ACCESS_TOKEN;
  if (!token) throw new Error("META_ACCESS_TOKEN not set");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function sendText(to: string, text: string) {
  const res = await fetch(getBaseUrl(), {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: { body: text },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`WhatsApp sendText failed: ${res.status} ${err}`);
  }
  return res.json();
}

export async function sendButtons(
  to: string,
  bodyText: string,
  buttons: { id: string; title: string }[],
) {
  const res = await fetch(getBaseUrl(), {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: bodyText },
        action: {
          buttons: buttons.map((b) => ({
            type: "reply",
            reply: { id: b.id, title: b.title },
          })),
        },
      },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`WhatsApp sendButtons failed: ${res.status} ${err}`);
  }
  return res.json();
}

export async function sendMedia(
  to: string,
  mediaUrl: string,
  mediaType: "image" | "video",
) {
  const res = await fetch(getBaseUrl(), {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: mediaType,
      [mediaType]: { link: mediaUrl },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`WhatsApp sendMedia failed: ${res.status} ${err}`);
  }
  return res.json();
}

export async function uploadMedia(fileUrl: string): Promise<string> {
  const res = await fetch(
    `https://graph.facebook.com/${API_VERSION}/${process.env.META_PHONE_NUMBER_ID}/media`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        messaging_product: "whatsapp",
        type: "image",
        link: fileUrl,
      }),
    },
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`WhatsApp uploadMedia failed: ${res.status} ${err}`);
  }
  const data = await res.json();
  return data.id;
}
