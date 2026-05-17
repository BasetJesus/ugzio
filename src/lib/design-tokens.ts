// UGZIO Design Tokens
// Warm operational intelligence — Stripe Dashboard + Linear + high-end fintech ops
// Emotion: controlled, protective, financially serious

export const tokens = {
  bg: {
    base: '#f5f5f0',        // warm off-white — calm operational base
    surface: '#ffffff',      // white cards — clean, trustworthy
    elevated: '#ffffff',     // modals, dropdowns
    border: '#e5e5e0',       // subtle warm borders
  },
  accent: {
    green: '#059669',        // protection green — primary CTA
    greenHover: '#047857',   // darker green on hover
    greenGlow: 'rgba(5,150,105,0.10)',
    greenLight: '#ecfdf5',   // light green bg for active states
  },
  status: {
    danger: '#dc2626',       // controlled red — high risk
    dangerBg: 'rgba(220,38,38,0.06)',
    warning: '#d97706',      // amber — medium risk
    warningBg: 'rgba(217,119,6,0.06)',
    success: '#059669',      // muted green — delivered, confirmed
    successBg: 'rgba(5,150,105,0.08)',
    info: '#2563eb',         // blue — neutral info
    infoBg: 'rgba(37,99,235,0.06)',
  },
  text: {
    primary: '#111827',      // near-black — max readability
    secondary: '#6b7280',    // gray-500 — secondary info
    muted: '#9ca3af',        // gray-400 — tertiary
    danger: '#dc2626',
    success: '#059669',
    warning: '#d97706',
  },
  font: {
    sans: 'var(--font-geist-sans)',
    mono: 'var(--font-geist-mono)',
  },
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    full: '9999px',
  },
  shadow: {
    card: '0 1px 2px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03)',
    elevated: '0 4px 16px rgba(0,0,0,0.08)',
    glow: '0 0 16px rgba(5,150,105,0.15)',
  },
}
