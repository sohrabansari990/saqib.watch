import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { customerName, customerWhatsApp, items, totalAmount, paymentMethod, address, city } =
      await request.json();

    const FONNTE_TOKEN = process.env.FONNTE_TOKEN;
    const STORE_WHATSAPP = process.env.STORE_WHATSAPP;

    if (!FONNTE_TOKEN || !STORE_WHATSAPP) {
      console.error("Missing FONNTE_TOKEN or STORE_WHATSAPP env variables");
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const itemsList = items
      .map((item) => {
        const colorText = item.color ? ` (${item.color})` : "";
        return `• ${item.name}${colorText} x${item.quantity} — Rs. ${item.price * item.quantity}`;
      })
      .join("\n");

    const paymentLabel =
      paymentMethod === "cod" ? "💵 Cash on Delivery" : "📱 EasyPaisa / JazzCash";

    const message = `🛒 *NEW ORDER — LAHZA TIMEPIECES*
━━━━━━━━━━━━━━━━━━━━
👤 *Customer:* ${customerName}
📞 *WhatsApp:* ${customerWhatsApp}
📍 *Address:* ${address}, ${city}
━━━━━━━━━━━━━━━━━━━━
🕰️ *Items Ordered:*
${itemsList}
━━━━━━━━━━━━━━━━━━━━
💰 *Total:* Rs. ${totalAmount}
💳 *Payment:* ${paymentLabel}
━━━━━━━━━━━━━━━━━━━━`;

    const response = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: FONNTE_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        target: STORE_WHATSAPP,
        message: message,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Fonnte API error:", data);
      return NextResponse.json({ error: "Failed to send WhatsApp message" }, { status: 502 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Send order error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
