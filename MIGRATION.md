# Image Storage Migration: Supabase → VPS

**Date completed:** May 16, 2026  
**Status:** ✅ Production + local both working

---

## Architecture Overview

```
Browser
  └── requests image from: https://images.saqib.watch/images/<filename>
        └── DNS A record: images.saqib.watch → 64.227.191.172
              └── nginx (port 443/80) on VPS
                    ├── GET  /images/*       → serves static files from /var/www/images/
                    └── POST /images/upload  → proxies to localhost:3001 (upload-server)
                              └── Express + Multer server (/root/upload-server/server.js)
                                    └── saves file to /var/www/images/
```

---

## Why We Migrated

- **Old:** Supabase Storage (`wcqpkhqsvysadvtcrkuk.supabase.co`)
- **New:** Self-hosted VPS (`64.227.191.172`) behind subdomain `images.saqib.watch`
- **Reason:** Cost + control over image storage

---

## VPS Details

| Item | Value |
|------|-------|
| IP | `64.227.191.172` |
| Provider | DigitalOcean |
| OS | Ubuntu |
| Web server | nginx 1.24.0 |
| Image server | Node.js + Express + Multer (pm2: `upload-server`) |
| Image server port | `3001` (internal only) |
| Image server file | `/root/upload-server/server.js` |
| Images stored at | `/var/www/images/` |
| Public subdomain | `https://images.saqib.watch` |
| SSL cert | Let's Encrypt via Certbot (expires Aug 14, 2026 — auto-renews) |

### DigitalOcean Firewall Rules (inbound)
| Port | Protocol | Purpose |
|------|----------|---------|
| 22 | TCP | SSH |
| 80 | TCP | HTTP (redirects to HTTPS via nginx) |
| 443 | TCP | HTTPS |
> ⚠️ Port 8080 is intentionally CLOSED. nginx handles 443→3001 internally.

---

## What Changed in the Codebase

### `next.config.js` + `next.config.mjs`
Added `images.saqib.watch` to `remotePatterns`:
```js
{
  protocol: "https",
  hostname: "images.saqib.watch",
  port: "",
  pathname: "/images/**",
}
```

### `src/lib/vpsUpload.js` *(new file)*
Upload helper used by admin product pages. Key behavior:
- POSTs `multipart/form-data` with field name `image` to `https://images.saqib.watch/images/upload`
- Server returns `{ url: "http://64.227.191.172:8080/images/<filename>" }` (raw IP)
- **We extract just the filename** and rebuild the URL as `https://images.saqib.watch/images/<filename>`
- This is necessary because the server hardcodes the IP — changing it requires editing `/root/upload-server/server.js` line 21

### `.env.local`
```env
NEXT_PUBLIC_IMAGE_BASE_URL=https://images.saqib.watch/images/
```
> ⚠️ This must also be set in your Vercel project environment variables for production!

### Admin pages migrated
- `src/app/admin/(protected)/products/new/page.js`
- `src/app/admin/(protected)/products/[id]/page.js`

Both previously used `supabase.storage.from("products").upload()`. Now use `uploadToVPS()`.

---

## Firestore Migration

All 35 products had their image URLs updated via `fix-urls-final.js`.

Fields updated per product:
- `imageUrl` — primary thumbnail
- `images[]` — gallery array
- `variants[].images[]` — per-color variant images

Old URL pattern: `https://wcqpkhqsvysadvtcrkuk.supabase.co/storage/v1/object/public/products/<filename>`  
New URL pattern: `https://images.saqib.watch/images/<filename>`

---

## Known Limitations / Tech Debt

### 1. Server returns raw IP URL
`/root/upload-server/server.js` line 21 hardcodes `http://64.227.191.172:8080/images/...`.  
`vpsUpload.js` works around this by extracting the filename and rebuilding with subdomain.

**Permanent fix:** SSH into VPS and change line 21 to:
```js
const url = `https://images.saqib.watch/images/${req.file.filename}`;
```
Then: `pm2 restart upload-server`

### 2. Deleted images stay on disk
When an admin removes an image from a product, the Firestore record is updated but the file remains on `/var/www/images/`. Disk usage grows over time.

**Future fix:** Add a DELETE endpoint to the upload server and call it when removing images.

### 3. No backup of /var/www/images/
Images on the VPS are not backed up. If the droplet is destroyed, all images are lost.

**Recommended:** Set up a DigitalOcean Spaces backup or periodic rsync to a backup server.

---

## SSL Certificate Renewal

Certbot auto-renews. To manually check:
```bash
sudo certbot certificates
sudo certbot renew --dry-run
```

---

## If Images Break Again — Checklist

1. Check VPS is running: `ssh root@64.227.191.172`
2. Check nginx: `sudo systemctl status nginx`
3. Check upload server: `pm2 status`
4. Test GET: `curl -I https://images.saqib.watch/images/<any-filename>`
5. Test upload: `curl -X POST https://images.saqib.watch/images/upload -F "image=@/tmp/test.png"`
6. Check Next.js config has `images.saqib.watch` in `remotePatterns`
7. Check Vercel env vars include `NEXT_PUBLIC_IMAGE_BASE_URL`

---

## Files to NEVER commit (gitignored)

- `serviceAccount.json` — Firebase admin credentials
- `fix-urls.js`, `fix-urls-v2.js`, `fix-urls-final.js` — one-time migration scripts
- `check-urls.js` — one-time audit script
