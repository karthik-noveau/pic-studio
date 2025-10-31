export function analyzeImage(canvas, ctx) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  // Color analysis
  const colorMap = new Map()
  let totalBrightness = 0
  let hasTransparency = false

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]

    if (a < 255) hasTransparency = true

    // Calculate brightness
    const brightness = r * 0.299 + g * 0.587 + b * 0.114
    totalBrightness += brightness

    // Quantize colors for dominant color detection
    const quantizedR = Math.floor(r / 32) * 32
    const quantizedG = Math.floor(g / 32) * 32
    const quantizedB = Math.floor(b / 32) * 32
    const colorKey = `${quantizedR},${quantizedG},${quantizedB}`

    colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1)
  }

  // Get dominant colors
  const totalPixels = data.length / 4
  const dominantColors = Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([color, count]) => {
      const [r, g, b] = color.split(",").map(Number)
      return {
        hex: `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`,
        rgb: { r, g, b },
        percentage: Math.round((count / totalPixels) * 100),
      }
    })

  const averageBrightness = totalBrightness / totalPixels
  const aspectRatio = canvas.width / canvas.height

  return {
    format: "Unknown", // Will be set from file type
    hasTransparency,
    dominantColors,
    averageBrightness: Math.round(averageBrightness),
    isLandscape: aspectRatio > 1,
    isPortrait: aspectRatio < 1,
    isSquare: Math.abs(aspectRatio - 1) < 0.01,
  }
}

export function getImageFormat(file) {
  if (typeof file === "string") {
    const url = file.toLowerCase()
    if (url.includes(".jpg") || url.includes(".jpeg")) return "JPEG"
    if (url.includes(".png")) return "PNG"
    if (url.includes(".gif")) return "GIF"
    if (url.includes(".webp")) return "WebP"
    if (url.includes(".svg")) return "SVG"
    if (url.includes(".bmp")) return "BMP"
    return "Unknown"
  }

  const type = file.type.toLowerCase()
  if (type.includes("jpeg")) return "JPEG"
  if (type.includes("png")) return "PNG"
  if (type.includes("gif")) return "GIF"
  if (type.includes("webp")) return "WebP"
  if (type.includes("svg")) return "SVG"
  if (type.includes("bmp")) return "BMP"
  return "Unknown"
}
