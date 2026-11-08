// Known digital tasks DeClear can guide a user through, plus a hand-written
// (scripted) fallback guide for each, in every supported language. The scripted
// guide is used when AI guidance is unavailable; the UI always labels whether
// the steps are live AI or scripted.
//
// IMPORTANT HONESTY NOTE: DeClear is a web app. It cannot see or control the
// apps on the user's phone. These are instructions the user follows by hand on
// their own device. DeClear never performs the action for them.
//
// Scripted steps are keyed scripted[device][language]. If a language is missing
// for a device, callers fall back to English ('en').

export const DEVICES = [
  { value: 'iphone', label: 'iPhone' },
  { value: 'android', label: 'Android phone' },
]

export const TASK_TYPES = {
  SEND_PHOTOS_WHATSAPP: 'send-photos-whatsapp',
  NONE: 'none',
}

// Per-language display label for each task (used in the guide heading and the
// AI prompt). Keyed by language with an English fallback.
const TASK_LABELS = {
  [TASK_TYPES.SEND_PHOTOS_WHATSAPP]: {
    en: 'Send photos on WhatsApp',
    fr: 'Envoyer des photos sur WhatsApp',
    es: 'Enviar fotos por WhatsApp',
    'zh-CN': '在 WhatsApp 上发送照片',
  },
}

// Scripted WhatsApp-on-iPhone steps in all four languages.
const WHATSAPP_IPHONE = {
  en: [
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
      instruction:
        'Tap the photo or photos you want to send. A tick or number appears on each one you choose.',
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
  fr: [
    {
      id: 's1',
      instruction:
        'Trouvez l’application WhatsApp sur votre iPhone et touchez-la une fois pour l’ouvrir.',
      detail:
        'WhatsApp a une icône verte avec un téléphone blanc dans une bulle de dialogue. Elle est généralement sur votre écran d’accueil. Si vous ne la trouvez pas, balayez vers le bas au milieu de l’écran et tapez « WhatsApp » dans la barre de recherche.',
    },
    {
      id: 's2',
      instruction:
        'Touchez le nom de la personne à qui vous voulez envoyer des photos.',
      detail:
        'Cela ouvre votre conversation avec elle. Si vous ne voyez pas son nom, touchez d’abord « Discussions » en bas. Vous pouvez aussi toucher la barre de recherche en haut et taper son nom.',
    },
    {
      id: 's3',
      instruction:
        'Touchez le petit « + » ou l’icône d’appareil photo en bas de l’écran.',
      detail:
        'Le « + » se trouve à gauche de la zone où vous écrivez un message. Sur certaines versions, c’est un trombone ou un appareil photo. Cela permet de joindre une photo.',
    },
    {
      id: 's4',
      instruction:
        'Touchez « Photothèque » pour choisir des photos que vous avez déjà.',
      detail:
        'Cela ouvre votre collection de photos. Si votre téléphone demande l’autorisation d’accéder aux photos, touchez « Autoriser » ou « Autoriser l’accès complet » pour que WhatsApp puisse les afficher.',
    },
    {
      id: 's5',
      instruction:
        'Touchez la ou les photos que vous voulez envoyer. Une coche ou un numéro apparaît sur chacune.',
      detail:
        'Vous pouvez en choisir plusieurs. Touchez à nouveau une photo pour la désélectionner. Prenez votre temps : rien n’est encore envoyé.',
    },
    {
      id: 's6',
      instruction:
        'Touchez la flèche verte ou le bouton « Envoyer » pour envoyer vos photos.',
      detail:
        'Le bouton d’envoi est généralement un cercle vert avec une flèche blanche, en bas à droite. Une fois touché, vos photos sont parties. Vous les verrez apparaître dans la conversation.',
    },
  ],
  es: [
    {
      id: 's1',
      instruction: 'Busque la aplicación WhatsApp en su iPhone y tóquela una vez para abrirla.',
      detail:
        'WhatsApp tiene un icono verde con un teléfono blanco dentro de un globo de diálogo. Suele estar en la pantalla de inicio. Si no lo encuentra, deslice hacia abajo en el centro de la pantalla y escriba «WhatsApp» en el buscador.',
    },
    {
      id: 's2',
      instruction: 'Toque el nombre de la persona a la que quiere enviar fotos.',
      detail:
        'Esto abre su conversación con ella. Si no ve su nombre, toque primero «Chats» abajo. También puede tocar la barra de búsqueda de arriba y escribir su nombre.',
    },
    {
      id: 's3',
      instruction: 'Toque el pequeño «+» o el icono de cámara cerca de la parte de abajo.',
      detail:
        'El «+» está a la izquierda del recuadro donde escribe un mensaje. En algunas versiones es un clip o una cámara. Esto le permite adjuntar una foto.',
    },
    {
      id: 's4',
      instruction: 'Toque «Fotos y vídeos» para elegir fotos que ya tiene.',
      detail:
        'Esto abre su colección de fotos. Si el teléfono pide permiso para acceder a las fotos, toque «Permitir» o «Permitir acceso completo» para que WhatsApp pueda mostrarlas.',
    },
    {
      id: 's5',
      instruction:
        'Toque la foto o fotos que quiere enviar. Aparece una marca o un número en cada una que elige.',
      detail:
        'Puede elegir más de una. Toque una foto otra vez para quitarla. Tómese su tiempo: todavía no se envía nada.',
    },
    {
      id: 's6',
      instruction: 'Toque la flecha verde o el botón «Enviar» para enviar sus fotos.',
      detail:
        'El botón de enviar suele ser un círculo verde con una flecha blanca en la esquina inferior derecha. Una vez que lo toque, sus fotos salen en camino. Las verá aparecer en la conversación.',
    },
  ],
  'zh-CN': [
    {
      id: 's1',
      instruction: '在 iPhone 上找到 WhatsApp 应用，轻点一次打开它。',
      detail:
        'WhatsApp 的图标是绿色的，里面有一个白色电话的对话气泡。它通常在主屏幕上。如果找不到，在屏幕中间向下滑动，在搜索框里输入“WhatsApp”。',
    },
    {
      id: 's2',
      instruction: '轻点您想发送照片的那个人的名字。',
      detail:
        '这会打开您与对方的聊天。如果看不到对方的名字，先轻点底部的“聊天”。您也可以轻点顶部的搜索栏，输入对方的名字。',
    },
    {
      id: 's3',
      instruction: '轻点屏幕底部附近的小“+”号或相机图标。',
      detail:
        '“+”号在您输入消息的方框左边。在某些版本里它是一个回形针或相机。通过它可以附上一张照片。',
    },
    {
      id: 's4',
      instruction: '轻点“照片和视频图库”，选择您已有的照片。',
      detail:
        '这会打开您的照片。如果手机询问是否允许访问照片，请点“允许”或“允许完全访问”，这样 WhatsApp 才能显示它们。',
    },
    {
      id: 's5',
      instruction: '轻点您想发送的一张或多张照片。每选中一张，上面会出现对勾或数字。',
      detail: '您可以选多张。再次轻点某张照片可取消选择。慢慢来，现在还没有发送。',
    },
    {
      id: 's6',
      instruction: '轻点绿色箭头或“发送”按钮，把照片发出去。',
      detail:
        '发送按钮通常是右下角一个带白色箭头的绿色圆圈。点一下后，照片就发出去了。您会看到它们出现在聊天里。',
    },
  ],
}

export const GUIDANCE_TASKS = {
  [TASK_TYPES.SEND_PHOTOS_WHATSAPP]: {
    id: TASK_TYPES.SEND_PHOTOS_WHATSAPP,
    labels: TASK_LABELS[TASK_TYPES.SEND_PHOTOS_WHATSAPP],
    label: TASK_LABELS[TASK_TYPES.SEND_PHOTOS_WHATSAPP].en, // English default
    app: 'WhatsApp',
    scripted: {
      iphone: WHATSAPP_IPHONE,
    },
  },
}

// The task's display label in a given language (English fallback).
export function taskLabel(taskType, language = 'en') {
  const labels = GUIDANCE_TASKS[taskType]?.labels
  if (!labels) return ''
  return labels[language] ?? labels.en
}

// Return the scripted steps for a task + device + language, or null if none.
// Falls back to English steps when the language is missing for that device.
export function getScriptedGuide(taskType, device = 'iphone', language = 'en') {
  const byDevice = GUIDANCE_TASKS[taskType]?.scripted?.[device]
  if (!byDevice) return null
  return byDevice[language] ?? byDevice.en ?? null
}

// The set of taskType values DeClear can actually guide.
export const GUIDABLE_TASK_TYPES = Object.keys(GUIDANCE_TASKS)

// A compact catalog for the AI prompt: each guidable task's id and label.
export function guidableTaskCatalog() {
  return GUIDABLE_TASK_TYPES.map((id) => ({
    taskType: id,
    label: GUIDANCE_TASKS[id].label,
  }))
}
