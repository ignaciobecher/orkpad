function renderInline(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
}

export function renderMarkdown(markdown: string): string {
  if (!markdown) return ''

  const lines = markdown.split('\n')
  const output: string[] = []
  let inCodeBlock = false
  let codeLang = ''
  let codeLines: string[] = []
  let inList: 'ul' | 'ol' | null = null
  let listItems: string[] = []
  let inBlockquote = false
  let blockquoteLines: string[] = []

  const flushList = () => {
    if (!inList) return
    const tag = inList
    output.push(`<${tag}>${listItems.map((i) => `<li>${i}</li>`).join('')}</${tag}>`)
    inList = null
    listItems = []
  }

  const flushBlockquote = () => {
    if (!inBlockquote) return
    output.push(`<blockquote>${blockquoteLines.join('<br>')}</blockquote>`)
    inBlockquote = false
    blockquoteLines = []
  }

  for (const line of lines) {
    // Code block delimiter
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        const escaped = codeLines.join('\n').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        output.push(`<pre><code${codeLang ? ` class="language-${codeLang}"` : ''}>${escaped}</code></pre>`)
        codeLines = []
        codeLang = ''
        inCodeBlock = false
      } else {
        flushList()
        flushBlockquote()
        codeLang = line.slice(3).trim()
        inCodeBlock = true
      }
      continue
    }

    if (inCodeBlock) {
      codeLines.push(line)
      continue
    }

    // Blockquote
    const bqMatch = line.match(/^> (.*)/)
    if (bqMatch) {
      flushList()
      inBlockquote = true
      blockquoteLines.push(renderInline(bqMatch[1]))
      continue
    } else if (inBlockquote && line.trim() === '') {
      flushBlockquote()
      continue
    } else if (inBlockquote) {
      flushBlockquote()
    }

    // Headers
    const h4 = line.match(/^#### (.+)/)
    if (h4) { flushList(); output.push(`<h4>${renderInline(h4[1])}</h4>`); continue }
    const h3 = line.match(/^### (.+)/)
    if (h3) { flushList(); output.push(`<h3>${renderInline(h3[1])}</h3>`); continue }
    const h2 = line.match(/^## (.+)/)
    if (h2) { flushList(); output.push(`<h2>${renderInline(h2[1])}</h2>`); continue }
    const h1 = line.match(/^# (.+)/)
    if (h1) { flushList(); output.push(`<h1>${renderInline(h1[1])}</h1>`); continue }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) { flushList(); output.push('<hr>'); continue }

    // Unordered list item
    const ulMatch = line.match(/^[-*+] (.+)/)
    if (ulMatch) {
      if (inList === 'ol') flushList()
      inList = 'ul'
      listItems.push(renderInline(ulMatch[1]))
      continue
    }

    // Ordered list item
    const olMatch = line.match(/^\d+\. (.+)/)
    if (olMatch) {
      if (inList === 'ul') flushList()
      inList = 'ol'
      listItems.push(renderInline(olMatch[1]))
      continue
    }

    // Empty line
    if (line.trim() === '') {
      flushList()
      output.push('')
      continue
    }

    // Regular paragraph
    flushList()
    output.push(`<p>${renderInline(line)}</p>`)
  }

  flushList()
  flushBlockquote()

  return output.filter((l) => l !== '').join('\n')
}
