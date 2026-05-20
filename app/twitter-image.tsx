import { ImageResponse } from "next/og"

export const alt = "UGZIO — Réduction des Annulations Ecommerce en Tunisie"
export const size = { width: 1200, height: 600 }
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-50%",
            left: "-25%",
            width: "800px",
            height: "800px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(124,58,237,0.25) 0%, rgba(124,58,237,0) 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-50%",
            right: "-25%",
            width: "800px",
            height: "800px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(124,58,237,0.15) 0%, rgba(124,58,237,0) 70%)",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "#7c3aed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              fontWeight: 700,
              color: "white",
            }}
          >
            U
          </div>
          <span
            style={{
              fontSize: "28px",
              fontWeight: 700,
              color: "white",
              letterSpacing: "-0.5px",
            }}
          >
            UGZIO
          </span>
        </div>
        <h1
          style={{
            fontSize: "44px",
            fontWeight: 800,
            color: "white",
            textAlign: "center",
            lineHeight: 1.2,
            maxWidth: "700px",
            margin: "0 0 12px",
            letterSpacing: "-1px",
          }}
        >
          Les annulations tuent votre ecommerce
        </h1>
        <p
          style={{
            fontSize: "20px",
            color: "rgba(255,255,255,0.6)",
            textAlign: "center",
            maxWidth: "500px",
            margin: 0,
          }}
        >
          Analyse, confirme et sécurise chaque commande avant l&apos;envoi
        </p>
        <div
          style={{
            display: "flex",
            gap: "20px",
            marginTop: "28px",
            fontSize: "14px",
            color: "rgba(168,85,247,0.8)",
          }}
        >
          <span>WhatsApp-native</span>
          <span style={{ color: "rgba(255,255,255,0.15)" }}>•</span>
          <span>COD-native</span>
          <span style={{ color: "rgba(255,255,255,0.15)" }}>•</span>
          <span>Mobile-native</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
