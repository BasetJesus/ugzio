const API_VERSION = "v22.0";

export interface WhatsAppCreds {
  phoneNumberId: string;
  accessToken: string;
}

async function getCreds(creds?: WhatsAppCreds): Promise<{ phoneNumberId: string; accessToken: string }> {
  if (creds?.phoneNumberId && creds?.accessToken) {
    return creds;
  }
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;
  if (!phoneNumberId) throw new Error("META_PHONE_NUMBER_ID not set");
  if (!accessToken) throw new Error("META_ACCESS_TOKEN not set");
  return { phoneNumberId, accessToken };
}

function getHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function sendText(to: string, text: string, creds?: WhatsAppCreds) {
  const { phoneNumberId, accessToken } = await getCreds(creds);
  const res = await fetch(`https://graph.facebook.com/${API_VERSION}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: getHeaders(accessToken),
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
  creds?: WhatsAppCreds,
) {
  const { phoneNumberId, accessToken } = await getCreds(creds);
  const res = await fetch(`https://graph.facebook.com/${API_VERSION}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: getHeaders(accessToken),
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
  creds?: WhatsAppCreds,
) {
  const { phoneNumberId, accessToken } = await getCreds(creds);
  const res = await fetch(`https://graph.facebook.com/${API_VERSION}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: getHeaders(accessToken),
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

export async function uploadMedia(fileUrl: string, creds?: WhatsAppCreds): Promise<string> {
  const { phoneNumberId, accessToken } = await getCreds(creds);
  const res = await fetch(
    `https://graph.facebook.com/${API_VERSION}/${phoneNumberId}/media`,
    {
      method: "POST",
      headers: getHeaders(accessToken),
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
