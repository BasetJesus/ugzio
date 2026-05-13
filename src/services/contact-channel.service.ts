import type { ContactChannel, ChannelType } from "@/types/whatsapp";

const CHANNELS: Record<ChannelType, ContactChannel> = {
  whatsapp: {
    type: "whatsapp",
    enabled: true,
    priority: 1,
    label: "WhatsApp",
  },
  sms: {
    type: "sms",
    enabled: false,
    priority: 2,
    label: "SMS",
  },
  call: {
    type: "call",
    enabled: false,
    priority: 3,
    label: "Appel téléphonique",
  },
};

export function getAvailableChannels(): ContactChannel[] {
  return Object.values(CHANNELS)
    .filter((c) => c.enabled)
    .sort((a, b) => a.priority - b.priority);
}

export function getChannel(type: ChannelType): ContactChannel {
  return CHANNELS[type] ?? { type, enabled: false, priority: 99, label: type };
}

export function isChannelEnabled(type: ChannelType): boolean {
  return CHANNELS[type]?.enabled ?? false;
}

export function getRecommendedChannel(): ContactChannel {
  return CHANNELS.whatsapp;
}

export async function mockSendViaChannel(
  channelType: ChannelType,
  to: string,
  text: string,
): Promise<{ success: boolean; messageId?: string }> {
  const channel = CHANNELS[channelType];
  if (!channel?.enabled) {
    return { success: false };
  }

  // Mock only — no real API calls
  console.log(`[${channelType.toUpperCase()}] To: ${to} | Message: ${text.slice(0, 80)}...`);

  return {
    success: true,
    messageId: `mock_${channelType}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  };
}
