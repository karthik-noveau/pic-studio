export const socialMediaPresets = [
  // Instagram
  {
    name: "Instagram Post (Square)",
    platform: "Instagram",
    width: 1080,
    height: 1080,
    aspectRatio: "1:1",
    description: "Standard square post",
    category: "post",
  },
  {
    name: "Instagram Post (Portrait)",
    platform: "Instagram",
    width: 1080,
    height: 1350,
    aspectRatio: "4:5",
    description: "Portrait post",
    category: "post",
  },
  {
    name: "Instagram Story",
    platform: "Instagram",
    width: 1080,
    height: 1920,
    aspectRatio: "9:16",
    description: "Story format",
    category: "story",
  },
  {
    name: "Instagram Reel",
    platform: "Instagram",
    width: 1080,
    height: 1920,
    aspectRatio: "9:16",
    description: "Reel format",
    category: "post",
  },

  // Facebook
  {
    name: "Facebook Post",
    platform: "Facebook",
    width: 1200,
    height: 630,
    aspectRatio: "1.91:1",
    description: "Standard post",
    category: "post",
  },
  {
    name: "Facebook Cover",
    platform: "Facebook",
    width: 1200,
    height: 315,
    aspectRatio: "3.81:1",
    description: "Cover photo",
    category: "cover",
  },
  {
    name: "Facebook Story",
    platform: "Facebook",
    width: 1080,
    height: 1920,
    aspectRatio: "9:16",
    description: "Story format",
    category: "story",
  },

  // Twitter/X
  {
    name: "Twitter Post",
    platform: "Twitter",
    width: 1200,
    height: 675,
    aspectRatio: "16:9",
    description: "Standard tweet image",
    category: "post",
  },
  {
    name: "Twitter Header",
    platform: "Twitter",
    width: 1500,
    height: 500,
    aspectRatio: "3:1",
    description: "Profile header",
    category: "cover",
  },

  // LinkedIn
  {
    name: "LinkedIn Post",
    platform: "LinkedIn",
    width: 1200,
    height: 627,
    aspectRatio: "1.91:1",
    description: "Standard post",
    category: "post",
  },
  {
    name: "LinkedIn Cover",
    platform: "LinkedIn",
    width: 1584,
    height: 396,
    aspectRatio: "4:1",
    description: "Profile cover",
    category: "cover",
  },

  // YouTube
  {
    name: "YouTube Thumbnail",
    platform: "YouTube",
    width: 1280,
    height: 720,
    aspectRatio: "16:9",
    description: "Video thumbnail",
    category: "post",
  },
  {
    name: "YouTube Banner",
    platform: "YouTube",
    width: 2560,
    height: 1440,
    aspectRatio: "16:9",
    description: "Channel banner",
    category: "cover",
  },

  // TikTok
  {
    name: "TikTok Video",
    platform: "TikTok",
    width: 1080,
    height: 1920,
    aspectRatio: "9:16",
    description: "Standard video",
    category: "post",
  },
]

export function calculateResizeForPreset(currentWidth, currentHeight, preset) {
  const currentRatio = currentWidth / currentHeight
  const targetRatio = preset.width / preset.height

  let newWidth
  let newHeight
  let cropInfo = null

  if (Math.abs(currentRatio - targetRatio) < 0.01) {
    // Same aspect ratio, just resize
    newWidth = preset.width
    newHeight = preset.height
  } else {
    // Different aspect ratio, calculate crop
    if (currentRatio > targetRatio) {
      // Current image is wider, crop width
      newHeight = currentHeight
      newWidth = Math.round(currentHeight * targetRatio)
      cropInfo = {
        x: Math.round((currentWidth - newWidth) / 2),
        y: 0,
        width: newWidth,
        height: newHeight,
      }
    } else {
      // Current image is taller, crop height
      newWidth = currentWidth
      newHeight = Math.round(currentWidth / targetRatio)
      cropInfo = {
        x: 0,
        y: Math.round((currentHeight - newHeight) / 2),
        width: newWidth,
        height: newHeight,
      }
    }
  }

  return {
    newWidth,
    newHeight,
    cropInfo,
    scaleToFinal: {
      width: preset.width,
      height: preset.height,
    },
  }
}
