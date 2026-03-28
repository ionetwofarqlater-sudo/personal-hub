import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative"
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 8,
          background: "radial-gradient(circle at 30% 30%, rgba(139,92,246,0.4) 0%, transparent 60%)"
        }}
      />
      <span
        style={{
          fontFamily: "serif",
          fontWeight: 700,
          fontSize: 18,
          color: "#e2d9f3",
          letterSpacing: "-1px",
          lineHeight: 1,
          textShadow: "0 0 8px rgba(167,139,250,0.9)"
        }}
      >
        H
      </span>
    </div>,
    { ...size }
  );
}
