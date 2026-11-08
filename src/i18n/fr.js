// French UI dictionary. Natural, respectful phrasing suitable for older
// adults. Mirrors the keys in en.js; any missing key falls back to English.

export default {
  'app.brand': 'DeClear',
  'app.tagline': 'Comprenez vos courriers et messages en mots simples',

  'progress.count': 'Étape {current} sur {total}',
  'progress.message': 'Message',
  'progress.actions': 'Actions',
  'progress.guidance': 'Guide',

  'stage.input.heading': 'Étape 1 : Choisissez ou collez un message',
  'stage.actions.heading': 'Étape 2 : Vos actions',
  'stage.guide.heading': 'Étape 3 : Guide étape par étape',

  'nav.continue': 'Continuer vers vos actions',
  'nav.backToMessage': 'Retour au message',
  'nav.backToActions': 'Retour à vos actions',
  'nav.startNew': 'Commencer un nouveau message',

  'settings.show': 'Modifier les réglages',
  'settings.hide': 'Masquer les réglages',
  'settings.heading': 'Réglages',
  'settings.saveFailed':
    'Vos réglages n’ont pas pu être enregistrés dans ce navigateur ; ils pourraient ne pas être retenus la prochaine fois. Ils s’appliquent tout de même maintenant.',
  'settings.mode.legend': 'Comment DeClear doit-il expliquer les messages ?',
  'settings.mode.demo.label': 'Mode démonstration',
  'settings.mode.demo.desc':
    'Explique les messages d’exemple. Fonctionne hors ligne. Rien n’est envoyé ailleurs.',
  'settings.mode.ai.label': 'Mode IA (Google Gemini)',
  'settings.mode.ai.desc':
    'Explique les messages que vous collez, à l’aide de Google Gemini. Nécessite votre consentement pour envoyer le texte.',
  'settings.consent.legend': 'Consentement à l’utilisation de l’IA (Google Gemini)',
  'settings.consent.notice':
    'En mode IA, le message que vous choisissez d’expliquer est envoyé par Internet au service Gemini de Google pour être traité. DeClear utilise l’offre gratuite de Google. En dehors de l’EEE, du Royaume-Uni et de la Suisse, Google peut utiliser le contenu de l’offre gratuite pour améliorer ses produits, et ce contenu peut être consulté par des personnes. N’envoyez rien que vous souhaitez garder privé. Vous pouvez revenir au mode démonstration à tout moment ; le mode démonstration n’envoie rien.',
  'settings.consent.checkbox':
    'Je comprends et j’accepte d’envoyer mon message à Google Gemini',
  'settings.consent.checkboxDesc':
    'Les explications par IA restent désactivées tant que vous ne cochez pas cette case.',
  'settings.level.legend': 'Quel niveau de détail pour les explications ?',
  'settings.level.brief.label': 'Bref',
  'settings.level.brief.desc': 'Un résumé court, en une ligne.',
  'settings.level.standard.label': 'Standard',
  'settings.level.standard.desc':
    'Une explication claire, en mots simples. (Par défaut)',
  'settings.level.guided.label': 'Guidé',
  'settings.level.guided.desc':
    'Un parcours plus long, étape par étape, avec plus de contexte.',
  'settings.language.legend': 'Quelle langue DeClear doit-il utiliser ?',
  'settings.language.help':
    'Ceci change toute l’interface de DeClear ainsi que les explications qu’il rédige. Votre message d’origine est toujours conservé dans sa propre langue.',
  'settings.readAloud.legend': 'Lire les explications à voix haute ?',
  'settings.readAloud.label':
    'Afficher un bouton « Lire à voix haute » avec chaque explication',
  'settings.readAloud.descOn':
    'Utilise la voix intégrée de votre navigateur. Rien n’est envoyé ailleurs.',
  'settings.readAloud.descOff':
    'Votre navigateur ne prend pas en charge la lecture à voix haute ; cette option est donc désactivée.',

  'language.en': 'Anglais (English)',
  'language.fr': 'Français',
  'language.es': 'Espagnol (Español)',
  'language.zh-CN': 'Chinois (简体中文)',

  'input.heading': 'Choisissez un exemple ou collez votre propre message',
  'input.samplesLabel': 'Messages d’exemple',
  'input.pasteLabel': 'Ou collez votre propre message ici',
  'input.placeholder': 'Saisissez ou collez une lettre, une facture ou un message...',
  'input.counter': '{count} sur {max} caractères',
  'input.tooLong': '. Ce message est trop long. Veuillez le raccourcir.',
  'input.explain': 'Expliquer ce message',

  'sample.selected': '✓ Sélectionné',
  'sample.choose': 'Choisir cet exemple',

  'processing.message': 'Traitement de votre message…',
  'processing.guide': 'Préparation de votre guide étape par étape…',

  'result.demoDisclaimer':
    'Ceci est une explication d’exemple fixe. Elle n’a pas été générée par une intelligence artificielle.',
  'result.dates.heading': 'Dates et échéances importantes',
  'result.dates.none': 'Aucune date importante n’a été trouvée.',
  'result.dates.unknown': 'Date non clairement indiquée',
  'result.actions.heading': 'Ce que vous devez faire',
  'result.actions.none': 'Aucune action requise n’a été trouvée.',
  'result.explanation.show': 'Afficher l’explication complète',
  'result.reply.show': 'Afficher une réponse que vous pourriez envoyer',
  'result.reply.note':
    'Ceci n’est qu’une suggestion, à utiliser si vous le souhaitez. DeClear n’envoie rien à votre place.',
  'result.checkPrefix': 'À vérifier : {label}',

  'urgency.None.label': 'Aucune urgence',
  'urgency.None.note': 'Rien d’urgent ici.',
  'urgency.Low.label': 'Faible urgence',
  'urgency.Low.note': 'Bon à noter, mais sans pression.',
  'urgency.Medium.label': 'Urgence moyenne',
  'urgency.Medium.note': 'Veuillez vous en occuper bientôt.',
  'urgency.High.label': 'Grande urgence',
  'urgency.High.note': 'Ceci demande votre attention rapidement.',

  'action.help': 'Aidez-moi à faire cela',
  'action.noGuide':
    'Un guide étape par étape pour cette tâche n’est pas encore disponible.',

  'original.heading': 'Message d’origine',
  'original.show': 'Afficher le message d’origine',
  'original.hide': 'Masquer le message d’origine',
  'original.none': 'Aucun message d’origine n’est disponible.',

  'guide.close': 'Fermer le guide',
  'guide.source.ai':
    'Ces étapes viennent d’être créées par l’IA pour votre situation.',
  'guide.source.scripted':
    'Ce sont les étapes rédigées par DeClear (pas de l’IA en direct).',
  'guide.disclaimer':
    'DeClear ne peut ni voir ni contrôler votre téléphone. Suivez ces étapes vous-même sur votre appareil. DeClear n’envoie rien et n’appuie sur rien à votre place.',
  'guide.stepCount': 'Étape {current} sur {total}',
  'guide.back': 'Précédent',
  'guide.repeat': 'Relire à voix haute',
  'guide.next': 'Suivant',
  'guide.done':
    'C’est la dernière étape. Bravo ! Vous pouvez revenir en arrière pour revoir une étape.',

  'stuck.open': 'Je suis bloqué(e)',
  'stuck.prompt':
    'Dites à DeClear ce que vous voyez à l’écran, et il réessaiera.',
  'stuck.placeholder':
    'Par exemple : je vois une liste de conversations mais pas de bouton +.',
  'stuck.screenshot.legend': 'Facultatif : ajouter une capture d’écran',
  'stuck.screenshot.note':
    'Vous pouvez ajouter une image de votre écran pour une aide plus précise. L’image est envoyée à l’IA pour cette seule réponse et n’est pas conservée par DeClear.',
  'stuck.screenshot.consent':
    'J’accepte d’envoyer une capture d’écran à l’IA pour cette réponse',
  'stuck.screenshot.choose': 'Choisir une capture d’écran',
  'stuck.screenshot.selected': 'Sélectionné : {name}',
  'stuck.screenshot.noConsent':
    'Activez le mode IA et consentez pour pouvoir aussi envoyer une capture d’écran. Sans cela, DeClear utilisera uniquement votre description écrite.',
  'stuck.submit': 'Aidez-moi avec ceci',
  'stuck.submitting': 'Obtention de nouvelles étapes…',
  'stuck.image.badType': 'Veuillez choisir une image PNG, JPEG ou WebP.',
  'stuck.image.tooLarge':
    'Cette image est trop grande. Veuillez en utiliser une d’environ 1 Mo maximum.',
  'stuck.image.unreadable':
    'Désolé, cette image n’a pas pu être lue. Veuillez en essayer une autre.',

  'readaloud.play': 'Lire ceci à voix haute',
  'readaloud.stop': 'Arrêter la lecture',
  'readaloud.unavailable':
    'Désolé, la lecture à voix haute ne fonctionne pas dans ce navigateur pour le moment.',
  'readaloud.noVoice':
    'Votre appareil n’a pas de voix pour cette langue ; la lecture à voix haute pourrait utiliser une autre voix ou ne pas fonctionner.',

  'error.processing':
    'Une erreur s’est produite lors de l’explication de ce message. Veuillez réessayer.',
  'error.guidanceUnavailable':
    'L’aide étape par étape n’est pas disponible pour le moment.',
  'error.stuckFailed':
    'Désolé, DeClear n’a pas pu obtenir de nouvelles étapes pour le moment.',

  'guide.notice.scriptedFallback':
    'L’aide par IA en direct n’était pas disponible ; voici donc les étapes rédigées par DeClear.',
  'guide.notice.unavailable':
    'L’aide étape par étape n’est pas disponible pour le moment.',
}
