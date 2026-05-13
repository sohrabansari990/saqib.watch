export const IMAGE_FRAME_OPTIONS = [
  { value: "auto", label: "Auto" },
  { value: "square", label: "Square" },
  { value: "portrait", label: "Portrait" },
];

export function normalizeImageFrame(value) {
  return IMAGE_FRAME_OPTIONS.some((option) => option.value === value) ? value : "auto";
}

export function detectImageFrame(dimensions) {
  if (!dimensions?.width || !dimensions?.height) {
    return null;
  }

  const ratio = dimensions.width / dimensions.height;
  return ratio <= 1.15 ? "portrait" : "square";
}

export function getImageFrameAspectRatio(value, dimensions, fallback = "portrait") {
  const frame = normalizeImageFrame(value);
  const resolvedFrame = frame === "auto" ? detectImageFrame(dimensions) || fallback : frame;

  return resolvedFrame === "square" ? "1 / 1" : "3 / 4";
}
