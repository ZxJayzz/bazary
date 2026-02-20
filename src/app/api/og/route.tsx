import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const title = searchParams.get("title") || "Bazary";
  const price = searchParams.get("price") || "";
  const locale = searchParams.get("locale") || "fr";

  const subtitle = locale === "mg"
    ? "Mividiana sy mivarotra eo akaikinao eto Madagasikara"
    : "Achetez et vendez près de chez vous à Madagascar";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#ffffff",
          position: "relative",
        }}
      >
        {/* Top gradient bar */}
        <div
          style={{
            width: "100%",
            height: "8px",
            background: "linear-gradient(90deg, #16a34a 0%, #22c55e 50%, #4ade80 100%)",
          }}
        />

        {/* Content area */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            flex: 1,
            padding: "60px 80px",
          }}
        >
          {/* Logo / Brand */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "32px",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #16a34a, #22c55e)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "28px",
                fontWeight: "bold",
                marginRight: "16px",
              }}
            >
              B
            </div>
            <span
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                color: "#16a34a",
              }}
            >
              Bazary
            </span>
          </div>

          {/* Product title */}
          <div
            style={{
              fontSize: title.length > 40 ? "42px" : "52px",
              fontWeight: "bold",
              color: "#1f2937",
              lineHeight: 1.2,
              marginBottom: "20px",
              maxWidth: "900px",
              display: "-webkit-box",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title.length > 80 ? title.slice(0, 77) + "..." : title}
          </div>

          {/* Price */}
          {price && (
            <div
              style={{
                fontSize: "40px",
                fontWeight: "bold",
                color: "#16a34a",
                marginBottom: "16px",
              }}
            >
              {price}
            </div>
          )}

          {/* Subtitle */}
          {!price && (
            <div
              style={{
                fontSize: "24px",
                color: "#6b7280",
                marginTop: "8px",
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 80px",
            backgroundColor: "#f9fafb",
            borderTop: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              fontSize: "18px",
              color: "#9ca3af",
            }}
          >
            bazary.mg
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "18px",
              color: "#9ca3af",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9ca3af"
              strokeWidth="2"
            >
              <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Madagascar
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
