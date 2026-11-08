// Spanish UI dictionary. Natural, respectful phrasing (formal "usted") suited
// to older adults. Mirrors en.js; missing keys fall back to English.

export default {
  'app.brand': 'DeClear',
  'app.tagline': 'Entienda sus cartas y mensajes en palabras sencillas',

  'progress.count': 'Paso {current} de {total}',
  'progress.message': 'Mensaje',
  'progress.actions': 'Acciones',
  'progress.guidance': 'Guía',

  'stage.input.heading': 'Paso 1: Elija o pegue un mensaje',
  'stage.actions.heading': 'Paso 2: Sus acciones',
  'stage.guide.heading': 'Paso 3: Guía paso a paso',

  'nav.continue': 'Continuar a sus acciones',
  'nav.backToMessage': 'Volver al mensaje',
  'nav.backToActions': 'Volver a sus acciones',
  'nav.startNew': 'Empezar un mensaje nuevo',

  'settings.show': 'Cambiar ajustes',
  'settings.hide': 'Ocultar ajustes',
  'settings.heading': 'Ajustes',
  'settings.saveFailed':
    'Sus ajustes no se pudieron guardar en este navegador, por lo que quizá no se recuerden la próxima vez. De todos modos, se aplican ahora.',
  'settings.mode.legend': '¿Cómo debe DeClear explicar los mensajes?',
  'settings.mode.demo.label': 'Modo demostración',
  'settings.mode.demo.desc':
    'Explica los mensajes de ejemplo. Funciona sin conexión. No se envía nada a ningún sitio.',
  'settings.mode.ai.label': 'Modo IA (Google Gemini)',
  'settings.mode.ai.desc':
    'Explica los mensajes que usted pega, usando Google Gemini. Requiere su consentimiento para enviar el texto.',
  'settings.consent.legend': 'Consentimiento para usar la IA (Google Gemini)',
  'settings.consent.notice':
    'En el modo IA, el mensaje que usted elige explicar se envía por Internet al servicio Gemini de Google para procesarlo. DeClear usa el nivel gratuito de Google. Fuera del EEE, el Reino Unido y Suiza, Google puede usar el contenido del nivel gratuito para mejorar sus productos, y ese contenido puede ser revisado por personas. No envíe nada que desee mantener privado. Puede volver al modo demostración en cualquier momento; el modo demostración no envía nada.',
  'settings.consent.checkbox':
    'Entiendo y acepto enviar mi mensaje a Google Gemini',
  'settings.consent.checkboxDesc':
    'Las explicaciones por IA permanecen desactivadas hasta que marque esta casilla.',
  'settings.level.legend': '¿Qué nivel de detalle para las explicaciones?',
  'settings.level.brief.label': 'Breve',
  'settings.level.brief.desc': 'Un resumen corto, de una línea.',
  'settings.level.standard.label': 'Estándar',
  'settings.level.standard.desc':
    'Una explicación clara, en palabras sencillas. (Predeterminado)',
  'settings.level.guided.label': 'Guiado',
  'settings.level.guided.desc':
    'Un recorrido más largo, paso a paso, con más contexto.',
  'settings.language.legend': '¿Qué idioma debe usar DeClear?',
  'settings.language.help':
    'Esto cambia toda la interfaz de DeClear y las explicaciones que escribe. Su mensaje original siempre se conserva en su propio idioma.',
  'settings.readAloud.legend': '¿Leer las explicaciones en voz alta?',
  'settings.readAloud.label':
    'Mostrar un botón «Leer en voz alta» con cada explicación',
  'settings.readAloud.descOn':
    'Usa la voz integrada de su navegador. No se envía nada a ningún sitio.',
  'settings.readAloud.descOff':
    'Su navegador no admite la lectura en voz alta, así que esta opción está desactivada.',

  'language.en': 'Inglés (English)',
  'language.fr': 'Francés (Français)',
  'language.es': 'Español',
  'language.zh-CN': 'Chino (简体中文)',

  'input.heading': 'Elija un ejemplo o pegue su propio mensaje',
  'input.samplesLabel': 'Mensajes de ejemplo',
  'input.pasteLabel': 'O pegue su propio mensaje aquí',
  'input.placeholder': 'Escriba o pegue una carta, factura o mensaje...',
  'input.counter': '{count} de {max} caracteres',
  'input.tooLong': '. Este mensaje es demasiado largo. Por favor, acórtelo.',
  'input.explain': 'Explicar este mensaje',

  'sample.selected': '✓ Seleccionado',
  'sample.choose': 'Elegir este ejemplo',

  'processing.message': 'Procesando su mensaje…',
  'processing.guide': 'Preparando su guía paso a paso…',

  'result.demoDisclaimer':
    'Esta es una explicación de ejemplo fija. No fue generada por inteligencia artificial.',
  'result.dates.heading': 'Fechas y plazos importantes',
  'result.dates.none': 'No se encontraron fechas importantes.',
  'result.dates.unknown': 'Fecha no indicada con claridad',
  'result.actions.heading': 'Lo que debe hacer',
  'result.actions.none': 'No se encontraron acciones necesarias.',
  'result.explanation.show': 'Mostrar la explicación completa',
  'result.reply.show': 'Mostrar una respuesta que podría enviar',
  'result.reply.note':
    'Esto es solo una sugerencia que puede usar si lo desea. DeClear no envía nada por usted.',
  'result.checkPrefix': 'Por favor compruebe: {label}',

  'urgency.None.label': 'Sin urgencia',
  'urgency.None.note': 'Nada urgente aquí.',
  'urgency.Low.label': 'Urgencia baja',
  'urgency.Low.note': 'Conviene tenerlo en cuenta, pero no corre prisa.',
  'urgency.Medium.label': 'Urgencia media',
  'urgency.Medium.note': 'Por favor, atiéndalo pronto.',
  'urgency.High.label': 'Urgencia alta',
  'urgency.High.note': 'Esto necesita su atención pronto.',

  'action.help': 'Ayúdeme a hacer esto',
  'action.noGuide':
    'Todavía no hay una guía paso a paso para esta tarea.',

  'original.heading': 'Mensaje original',
  'original.show': 'Mostrar el mensaje original',
  'original.hide': 'Ocultar el mensaje original',
  'original.none': 'No hay ningún mensaje original disponible.',

  'guide.close': 'Cerrar la guía',
  'guide.source.ai':
    'Estos pasos los acaba de crear la IA para su situación.',
  'guide.source.scripted':
    'Estos son los pasos escritos por DeClear (no IA en vivo).',
  'guide.disclaimer':
    'DeClear no puede ver ni controlar su teléfono. Siga estos pasos usted mismo en su dispositivo. DeClear nunca envía nada ni toca nada por usted.',
  'guide.stepCount': 'Paso {current} de {total}',
  'guide.back': 'Atrás',
  'guide.repeat': 'Repetir en voz alta',
  'guide.next': 'Siguiente',
  'guide.done':
    'Este es el último paso. ¡Muy bien! Puede volver atrás para repasar cualquier paso.',

  'stuck.open': 'Estoy atascado',
  'stuck.prompt':
    'Dígale a DeClear qué ve en su pantalla y lo intentará de nuevo.',
  'stuck.placeholder':
    'Por ejemplo: veo una lista de chats pero no el botón +.',
  'stuck.screenshot.legend': 'Opcional: añadir una captura de pantalla',
  'stuck.screenshot.note':
    'Puede añadir una imagen de su pantalla para recibir ayuda más exacta. La imagen se envía a la IA solo para esta respuesta y DeClear no la guarda.',
  'stuck.screenshot.consent':
    'Acepto enviar una captura de pantalla a la IA para esta respuesta',
  'stuck.screenshot.choose': 'Elegir una captura de pantalla',
  'stuck.screenshot.selected': 'Seleccionado: {name}',
  'stuck.screenshot.noConsent':
    'Active el modo IA y dé su consentimiento para enviar también una captura de pantalla. Sin eso, DeClear usará solo su descripción escrita.',
  'stuck.submit': 'Ayúdeme con esto',
  'stuck.submitting': 'Obteniendo nuevos pasos…',
  'stuck.image.badType': 'Por favor, elija una imagen PNG, JPEG o WebP.',
  'stuck.image.tooLarge':
    'Esa imagen es demasiado grande. Por favor, use una de menos de 1 MB aproximadamente.',
  'stuck.image.unreadable':
    'Lo sentimos, no se pudo leer esa imagen. Por favor, pruebe con otra.',

  'readaloud.play': 'Leer esto en voz alta',
  'readaloud.stop': 'Detener la lectura',
  'readaloud.unavailable':
    'Lo sentimos, la lectura en voz alta no funciona en este navegador ahora mismo.',
  'readaloud.noVoice':
    'Su dispositivo no tiene una voz para este idioma, así que la lectura en voz alta puede usar otra voz o no funcionar.',

  'error.processing':
    'Algo salió mal al explicar este mensaje. Por favor, inténtelo de nuevo.',
  'error.guidanceUnavailable':
    'La ayuda paso a paso no está disponible en este momento.',
  'error.stuckFailed':
    'Lo sentimos, DeClear no pudo obtener nuevos pasos en este momento.',

  'guide.notice.scriptedFallback':
    'La ayuda por IA en vivo no estaba disponible, así que estos son los pasos escritos por DeClear.',
  'guide.notice.unavailable':
    'La ayuda paso a paso no está disponible en este momento.',
}
