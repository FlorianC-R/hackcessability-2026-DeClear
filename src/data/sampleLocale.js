// Localized titles and summaries for the demo sample messages, keyed by sample
// id then language. The sample MESSAGE TEXT itself is never translated (it is
// the original the user is learning to read); only the title/summary shown on
// the card are localized. Missing languages fall back to English.

const SAMPLE_LOCALE = {
  'clinic-appointment': {
    en: {
      title: 'Appointment reminder',
      summary: 'A reminder from a medical clinic about an upcoming visit.',
    },
    fr: {
      title: 'Rappel de rendez-vous',
      summary: 'Un rappel d’une clinique médicale au sujet d’une prochaine visite.',
    },
    es: {
      title: 'Recordatorio de cita',
      summary: 'Un recordatorio de una clínica médica sobre una próxima visita.',
    },
    'zh-CN': {
      title: '预约提醒',
      summary: '来自诊所的一条关于即将到来的就诊的提醒。',
    },
  },
  'electricity-bill': {
    en: {
      title: 'Electricity bill',
      summary: 'A bill from an electricity provider with an amount and due date.',
    },
    fr: {
      title: 'Facture d’électricité',
      summary: 'Une facture d’un fournisseur d’électricité avec un montant et une date limite.',
    },
    es: {
      title: 'Factura de electricidad',
      summary: 'Una factura de una compañía eléctrica con un importe y una fecha límite.',
    },
    'zh-CN': {
      title: '电费账单',
      summary: '一张来自电力公司的账单，含金额和截止日期。',
    },
  },
  'family-message': {
    en: {
      title: 'Message from family',
      summary: 'A friendly message from a family member with a loose plan.',
    },
    fr: {
      title: 'Message de la famille',
      summary: 'Un message amical d’un membre de la famille avec un projet encore flou.',
    },
    es: {
      title: 'Mensaje de la familia',
      summary: 'Un mensaje amistoso de un familiar con un plan todavía sin concretar.',
    },
    'zh-CN': {
      title: '家人的消息',
      summary: '一条家人发来的、计划还不确定的友好消息。',
    },
  },
  'grandchild-photos': {
    en: {
      title: 'Message asking for photos',
      summary: 'A grandchild asks you to send some holiday photos to them on WhatsApp.',
    },
    fr: {
      title: 'Message demandant des photos',
      summary: 'Un petit-enfant vous demande d’envoyer des photos de vacances sur WhatsApp.',
    },
    es: {
      title: 'Mensaje pidiendo fotos',
      summary: 'Un nieto le pide que le envíe algunas fotos de las vacaciones por WhatsApp.',
    },
    'zh-CN': {
      title: '索要照片的消息',
      summary: '孙辈请您通过 WhatsApp 发一些度假照片给他们。',
    },
  },
}

// Return { title, summary } for a sample in a language, falling back to English,
// then to the sample's own built-in title/summary.
export function localizedSampleMeta(sample, language) {
  const byId = SAMPLE_LOCALE[sample.id]
  const loc = byId?.[language] ?? byId?.en
  return {
    title: loc?.title ?? sample.title,
    summary: loc?.summary ?? sample.summary,
  }
}

export default SAMPLE_LOCALE
