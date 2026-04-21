import { NextResponse } from "next/server";
import { buildWhatsAppOrderMessage } from "@/lib/order";

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

    const paymentLabel =
      paymentMethod === "cod" ? "💵 Cash on Delivery" : "📱 EasyPaisa / JazzCash";

    const message = buildWhatsAppOrderMessage({
      title: "🛒 *NEW ORDER — Saqib Watches*",
      items,
      customer: {
        name: customerName,
        whatsapp: customerWhatsApp,
        address,
        city,
      },
      totalAmount,
      paymentMethod: paymentLabel,
    });

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
