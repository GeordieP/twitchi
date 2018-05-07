export const QUALITY_OPTIONS = [
    "best",
    "1080p60",
    "900p60",
    "720p60",
    "720p",
    "480p",
    "360p",
    "160p",
    "worst",
    "audio_only",
]

// the values below must exactly match the stream viewer types defined in the twitchi core.
// currently these live in core/util.js.
// The keys presented here are named as a more reader-friendly version, as they're directly
// used as dropdown menu options in preferences page.
export const STREAM_VIEWER_OPTIONS = Object.freeze({
    // corresponding core/util.StreamViewerTypes key: STREAMLINK
    'Streamlink': 0,
    // corresponding core/util.StreamViewerTypes key: ELECTRON
    'Twitch Player (Twitchi Window)': 1
})