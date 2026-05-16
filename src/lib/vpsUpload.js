/**
 * Uploads an image file to the VPS image server.
 * @param {File} file - The file object to upload.
 * @returns {Promise<string>} The public URL of the uploaded image (using images.saqib.watch).
 */
export async function uploadToVPS(file) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    const formData = new FormData();
    formData.append("image", file, fileName);

    // Upload endpoint: POST https://images.saqib.watch/images/upload
    // nginx proxies /images/upload → 127.0.0.1:3001 on the VPS
    const baseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL; // https://images.saqib.watch/images/
    const uploadUrl = `${baseUrl}upload`;

    const res = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`VPS upload failed: ${res.status} ${text}`);
    }

    const data = await res.json();

    // The VPS server returns: { url: "http://64.227.191.172:8080/images/<filename>" }
    // That URL uses the raw IP + blocked port 8080. We extract just the filename
    // and rebuild it using our HTTPS subdomain so it always works correctly.
    if (data.url) {
        const uploadedFilename = data.url.split("/").pop();
        return `${baseUrl}${uploadedFilename}`;
    }

    // Ultimate fallback: use the filename we generated
    return `${baseUrl}${fileName}`;
}
