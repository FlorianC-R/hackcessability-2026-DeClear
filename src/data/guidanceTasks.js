// Known digital tasks DeClear can guide a user through, plus a hand-written
// (scripted) fallback guide for each. The scripted guide is used when AI
// guidance is unavailable (no consent, quota exhausted, offline, etc.), and the
// UI ALWAYS labels whether the steps the user is seeing came from live AI or
// from this scripted fallback.
//
// IMPORTANT HONESTY NOTE: DeClear is a web app. It cannot see or control the
// apps on the user's phone. These are instructions the user follows by hand on
// their own device. DeClear never performs the action for them.

export const DEVICES = [
  { value: 'iphone', label: 'iPhone' },
  { value: 'android', label: 'Android phone' },
]

export const TASK_TYPES = {
  SEND_PHOTOS_WHATSAPP: 'send-photos-whatsapp',
  NONE: 'none',
}

// Metadata for each task we recognise. `appName`/`device` drive the AI prompt
// and the on-screen labels. Only the WhatsApp-on-iPhone task is fully built out
// for the MVP demo; others can be added later.
export const GUIDANCE_TASKS = {
  [TASK_TYPES.SEND_PHOTOS_WHATSAPP]: {
    id: TASK_TYPES.SEND_PHOTOS_WHATSAPP,
    label: 'Send photos on WhatsApp',
    app: 'WhatsApp',
    // The scripted fallback. Steps are intentionally one-action-each and plain.
    scripted: {
      iphone: [
        {
          id: 's1',
          instruction: 'Find the WhatsApp app on your iPhone and tap it once to open it.',
          detail:
            'WhatsApp has a green icon with a white telephone inside a speech bubble. It is usually on your Home Screen. If you cannot find it, swipe down on the middle of the screen and type "WhatsApp" in the search box.',
        },
        {
          id: 's2',
          instruction: 'Tap the name of the person you want to send photos to.',
          detail:
            'This opens your conversation with them. If you do not see their name, tap "Chats" at the bottom first. You can also tap the search bar at the top and type their name.',
        },
        {
          id: 's3',
          instruction: 'Tap the small "+" or camera icon near the bottom of the screen.',
          detail:
            'The "+" is to the left of the box where you type a message. On some versions it is a paperclip or a camera. This lets you attach a photo.',
        },
        {
          id: 's4',
          instruction: 'Tap "Photo & Video Library" to choose photos you already have.',
          detail:
            'This opens your photo collection. If your phone asks for permission to access photos, tap "Allow" or "Allow Full Access" so WhatsApp can show them.',
        },
        {
          id: 's5',
          instruction: 'Tap the photo or photos you want to send. A tick or number appears on each one you choose.',
          detail:
            'You can pick more than one. Tap a photo again to un-choose it. Take your time — nothing is sent yet.',
        },
        {
          id: 's6',
          instruction: 'Tap the green arrow or "Send" button to send your photos.',
          detail:
            'The send button is usually a green circle with a white arrow in the bottom-right corner. Once you tap it, your photos are on their way. You will see them appear in the conversation.',
        },
      ],
    },
  },
}

// Return the scripted steps for a task + device, or null if none exist.
export function getScriptedGuide(taskType, device = 'iphone') {
  const task = GUIDANCE_TASKS[taskType]
  if (!task) return null
  return task.scripted?.[device] ?? null
}
