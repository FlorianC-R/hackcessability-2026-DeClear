// Simplified Chinese UI dictionary. Natural, respectful phrasing suited to
// older adults. Mirrors en.js; missing keys fall back to English.

export default {
  'app.brand': 'DeClear',
  'app.tagline': '用简单易懂的话，帮您看懂手机和电脑',

  'progress.count': '第 {current} 步，共 {total} 步',
  'progress.message': '信息',
  'progress.actions': '要做的事',
  'progress.guidance': '操作指引',

  'stage.input.heading': '第 1 步：选择或粘贴一条信息',
  'stage.actions.heading': '第 2 步：您要做的事',
  'stage.guide.heading': '第 3 步：分步操作指引',

  'nav.continue': '继续查看要做的事',
  'nav.backToMessage': '返回信息',
  'nav.backToActions': '返回要做的事',
  'nav.startNew': '开始一条新信息',

  'settings.show': '更改设置',
  'settings.hide': '隐藏设置',
  'settings.heading': '设置',
  'settings.saveFailed':
    '您的设置无法在此浏览器中保存，下次可能不会被记住。但现在仍然生效。',
  'settings.mode.legend': 'DeClear 应如何为您解释信息？',
  'settings.mode.demo.label': '演示模式',
  'settings.mode.demo.desc': '解释示例信息。可离线使用，不会把内容发送到任何地方。',
  'settings.mode.ai.label': 'AI 模式（Google Gemini）',
  'settings.mode.ai.desc':
    '使用 Google Gemini 解释您粘贴的信息。需要您同意才会发送文本。',
  'settings.consent.legend': '同意使用 AI（Google Gemini）',
  'settings.consent.notice':
    '在 AI 模式下，您选择解释的信息会通过网络发送到 Google 的 Gemini 服务进行处理。DeClear 使用 Google 的免费额度。在欧洲经济区、英国和瑞士以外的地区，Google 可能会使用免费额度的内容来改进其产品，并可能由人工审阅这些内容。请不要发送您想保密的内容。您可以随时切换回演示模式；演示模式不会发送任何内容。',
  'settings.consent.checkbox': '我已理解并同意将我的信息发送给 Google Gemini',
  'settings.consent.checkboxDesc': '在您勾选此项之前，AI 解释将保持关闭。',
  'settings.level.legend': '解释应有多详细？',
  'settings.level.brief.label': '简短',
  'settings.level.brief.desc': '一行字的简短摘要。',
  'settings.level.standard.label': '标准',
  'settings.level.standard.desc': '用简单的话清楚解释。（默认）',
  'settings.level.guided.label': '详细指引',
  'settings.level.guided.desc': '更长的分步讲解，附带更多背景说明。',
  'settings.language.legend': 'DeClear 应使用哪种语言？',
  'settings.language.help':
    '这会改变 DeClear 的整个界面以及它所写的解释。您的原始信息始终保留其原本的语言。',
  'settings.readAloud.legend': '是否朗读解释？',
  'settings.readAloud.label': '在每条解释旁显示“朗读”按钮',
  'settings.readAloud.descOn': '使用您浏览器自带的语音。不会把内容发送到任何地方。',
  'settings.readAloud.descOff': '您的浏览器不支持朗读，因此此选项已关闭。',

  'language.en': '英语 (English)',
  'language.fr': '法语 (Français)',
  'language.es': '西班牙语 (Español)',
  'language.zh-CN': '简体中文',

  'input.heading': '粘贴或输入一条信息',
  'input.samplesLabel': '示例信息',
  'input.samplesHeading': '或选择一个示例',
  'input.pasteLabel': '在此粘贴或输入您的信息',
  'input.placeholder': '输入或粘贴一封信、一张账单或一条信息……',
  'input.counter': '{count} / {max} 个字符',
  'input.tooLong': '。这条信息太长了，请缩短后再试。',
  'input.explain': '解释这条信息',

  'sample.selected': '✓ 已选择',
  'sample.choose': '选择此示例',

  'processing.message': '正在处理您的信息……',
  'processing.guide': '正在准备您的分步指引……',

  'result.demoDisclaimer': '这是一条预先写好的示例解释，并非由人工智能生成。',
  'result.dates.heading': '重要日期和截止时间',
  'result.dates.none': '未找到重要日期。',
  'result.dates.unknown': '日期未明确说明',
  'result.actions.heading': '您需要做的事',
  'result.actions.none': '未找到需要做的事。',
  'result.explanation.show': '显示完整解释',
  'result.reply.show': '显示一条您可以发送的回复',
  'result.reply.note': '这只是一个建议，您可以自行选择是否使用。DeClear 不会替您发送任何内容。',
  'result.checkPrefix': '请核对：{label}',

  'urgency.None.label': '不紧急',
  'urgency.None.note': '这里没有需要赶时间的事。',
  'urgency.Low.label': '不太紧急',
  'urgency.Low.note': '值得留意，但不着急。',
  'urgency.Medium.label': '较为紧急',
  'urgency.Medium.note': '请尽快处理。',
  'urgency.High.label': '非常紧急',
  'urgency.High.note': '这需要您尽快处理。',

  'action.help': '帮我完成这件事',
  'action.noGuide': '此任务的分步指引尚未提供。',

  'original.heading': '原始信息',
  'original.show': '显示原始信息',
  'original.hide': '隐藏原始信息',
  'original.none': '没有可显示的原始信息。',

  'guide.close': '关闭指引',
  'guide.source.ai': '这些步骤是 AI 刚刚针对您的情况生成的。',
  'guide.source.scripted': '这些是 DeClear 预先写好的步骤（不是实时 AI）。',
  'guide.disclaimer':
    'DeClear 无法看到或操作您的手机。请您自己在设备上按照这些步骤操作。DeClear 绝不会替您发送或点按任何内容。',
  'guide.stepCount': '第 {current} 步，共 {total} 步',
  'guide.back': '上一步',
  'guide.repeat': '再次朗读',
  'guide.next': '下一步',
  'guide.done': '这是最后一步。做得好！您可以返回查看任何一步。',

  'stuck.open': '我遇到困难了',
  'stuck.prompt': '告诉 DeClear 您在屏幕上看到了什么，它会再试一次。',
  'stuck.placeholder': '例如：我看到一列聊天，但没有“+”号按钮。',
  'stuck.screenshot.legend': '可选：添加一张截图',
  'stuck.screenshot.note':
    '您可以添加一张屏幕截图以获得更准确的帮助。该图片仅为这一次回答发送给 AI，DeClear 不会保存它。',
  'stuck.screenshot.consent': '我同意为这次回答向 AI 发送一张截图',
  'stuck.screenshot.choose': '选择一张截图',
  'stuck.screenshot.selected': '已选择：{name}',
  'stuck.screenshot.noConsent':
    '请开启 AI 模式并同意，才能一并发送截图。否则，DeClear 将只使用您的文字描述。',
  'stuck.submit': '帮我解决这个问题',
  'stuck.submitting': '正在获取新的步骤……',
  'stuck.image.badType': '请选择 PNG、JPEG 或 WebP 格式的图片。',
  'stuck.image.tooLarge': '该图片太大了。请使用大约 1 MB 以内的图片。',
  'stuck.image.unreadable': '抱歉，无法读取该图片。请换一张试试。',

  'readaloud.play': '朗读这段内容',
  'readaloud.stop': '停止朗读',
  'readaloud.unavailable': '抱歉，此浏览器目前无法朗读。',
  'readaloud.noVoice':
    '您的设备没有这种语言的语音，朗读可能会使用其他语音或无法正常工作。',

  'error.processing': '解释这条信息时出了点问题，请再试一次。',
  'error.guidanceUnavailable': '分步帮助目前不可用。',
  'error.stuckFailed': '抱歉，DeClear 目前无法获取新的步骤。',

  'guide.notice.scriptedFallback': '当前无法使用实时 AI 帮助，以下是 DeClear 预先写好的步骤。',
  'guide.notice.unavailable': '分步帮助目前不可用。',
}
