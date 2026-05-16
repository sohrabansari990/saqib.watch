/**
 * Uploads an image file to the VPS image server.
 * @param {File} file - The file object to upload.
 * @returns {Promise<string>} The public URL of the uploaded image.
 */
export async function uploadToVPS(file) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    const formData = new FormData();
    formData.append("image", file, fileName);

    const res = await fetch(`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}upload`, {
        method: "POST",
        body: formData,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`VPS upload failed: ${res.status} ${text}`);
    }

    const data = await res.json();
    // The server should return { url: "http://64.227.191.172:8080/images/<filename>" }
    // Fallback: construct URL from base + filename if server returns just the filename
    return data.url ?? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${fileName}`;
}
