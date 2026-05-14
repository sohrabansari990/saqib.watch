const ORDER_WHATSAPP_NUMBER = "923095225815";

function normalizeText(value) {
    return String(value ?? "").trim().toLowerCase();
}

function toNumber(value) {
    if (typeof value === "number") {
        return value;
    }

    const parsed = Number(String(value ?? 0).replace(/[^0-9.-]+/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
}

export function formatPrice(value) {
    return toNumber(value).toLocaleString("en-US");
}

export function getItemVariantLabel(item) {
    return item?.selectedColor || item?.color || item?.variant || null;
}

export function getItemDisplayColor(item) {
    const variantLabel = getItemVariantLabel(item);
    const variants = Array.isArray(item?.variants) ? item.variants : [];

    if (variantLabel) {
        const normalizedLabel = normalizeText(variantLabel);
        const matchedVariant = variants.find(
            (variant) => normalizeText(variant?.color) === normalizedLabel
        );

        if (matchedVariant?.hex) {
            return matchedVariant.hex;
        }
    }

    return item?.hex || item?.color || null;
}

export function getItemDisplayImageUrl(item) {
    const variantLabel = getItemVariantLabel(item);
    const variants = Array.isArray(item?.variants) ? item.variants : [];

    if (variantLabel) {
        const normalizedLabel = normalizeText(variantLabel);
        const matchedVariant = variants.find(
            (variant) => normalizeText(variant?.color) === normalizedLabel
        );

        if (matchedVariant?.images?.length > 0) {
            return matchedVariant.images[0];
        }
    }

    if (item?.selectedImage) {
        return item.selectedImage;
    }

    if (Array.isArray(item?.images) && item.images.length > 0) {
        return item.images[0];
    }

    return item?.imageUrl || null;
}

function formatOrderItemLine(item) {
    const quantity = item?.quantity ?? 1;
    const variantLabel = getItemVariantLabel(item);
    const variantSuffix = variantLabel ? ` (${variantLabel})` : "";
    const total = toNumber(item?.price) * quantity;

    return `${item?.name || "Item"}${variantSuffix} x${quantity} — Rs. ${formatPrice(total)}`;
}

export function formatOrderItems(items = [], separator = " | ") {
    return items.map((item) => formatOrderItemLine(item)).join(separator);
}

export function formatWhatsAppOrderItems(items = []) {
    return items.map((item) => `• ${formatOrderItemLine(item)}`).join("\n");
}

export function buildProductWhatsAppMessage(product, selectedColor, quantity = 1) {
    const colorLine = selectedColor ? `\nColor: ${selectedColor}` : "";
    const quantityLine = quantity > 1 ? `\nQuantity: ${quantity}` : "";

    return `Hi! I'd like to order:\n\n*${product?.name || "Selected watch"}*\nPrice: Rs. ${formatPrice(product?.price)}${colorLine}${quantityLine}\nModel: ${product?.model || product?.id || "N/A"}\n\nPlease confirm availability.`;
}

export function buildWhatsAppOrderMessage({
    title = "🛒 *NEW ORDER — Saqib Watches*",
    items = [],
    customer = {},
    totalAmount,
    paymentMethod,
    intro,
    outro,
    includeCustomer = true,
} = {}) {
    const lines = [title, "━━━━━━━━━━━━━━━━━━━━"];

    if (intro) {
        lines.push(intro);
    }

    if (includeCustomer) {
        const customerLines = [];

        if (customer.name) customerLines.push(`👤 *Customer:* ${customer.name}`);
        if (customer.whatsapp) customerLines.push(`📞 *WhatsApp:* ${customer.whatsapp}`);

        const addressParts = [customer.address, customer.city].filter(Boolean);
        if (addressParts.length > 0) {
            customerLines.push(`📍 *Address:* ${addressParts.join(", ")}`);
        }

        if (customer.province) customerLines.push(`🗺️ *Province:* ${customer.province}`);
        if (customer.note) customerLines.push(`📝 *Note:* ${customer.note}`);

        if (customerLines.length > 0) {
            lines.push(...customerLines, "━━━━━━━━━━━━━━━━━━━━");
        }
    }

    lines.push("🕰️ *Items Ordered:*");
    if (items.length > 0) {
        lines.push(...formatWhatsAppOrderItems(items).split("\n"));
    } else {
        lines.push("• No items");
    }

    lines.push("━━━━━━━━━━━━━━━━━━━━");

    if (totalAmount !== undefined && totalAmount !== null) {
        lines.push(`💰 *Total:* Rs. ${formatPrice(totalAmount)}`);
    }

    if (paymentMethod) {
        lines.push(`💳 *Payment:* ${paymentMethod}`);
    }

    if (outro) {
        lines.push(outro);
    }

    lines.push("━━━━━━━━━━━━━━━━━━━━");
    return lines.join("\n");
}

export function buildWhatsAppUrl(message, number = ORDER_WHATSAPP_NUMBER) {
    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export { ORDER_WHATSAPP_NUMBER };
