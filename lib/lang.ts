const SINHALA = /[඀-෿]/

// Returns "si" when the text contains Sinhala letters so the page can give it the taller Sinhala line-height.
export function langOf(text?: string | null): 'si' | undefined {
  return text && SINHALA.test(text) ? 'si' : undefined
}
