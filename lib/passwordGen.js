import crypto from 'crypto'

/**
 * Generate a strong temporary password
 * Format: Xxxx-0000 (memorable but secure)
 * Example: Kalo-4872
 */
export function generateTempPassword() {
  // Pick a random consonant-vowel pattern for memorability
  const consonants = 'BCDFGHJKLMNPRSTVWXZbcdfghjklmnprstvwxz'
  const vowels     = 'AEIOUaeiou'
  const digits     = '0123456789'

  // 4 letters (Cap + lower + lower + lower) + dash + 4 digits
  const c1 = consonants[crypto.randomInt(0, consonants.length / 2)]   // uppercase
  const v1 = vowels[crypto.randomInt(0, vowels.length / 2)]            // uppercase vowel → lowercase
  const c2 = consonants[crypto.randomInt(consonants.length / 2, consonants.length)] // lowercase
  const v2 = vowels[crypto.randomInt(vowels.length / 2, vowels.length)]            // lowercase vowel

  const d1 = digits[crypto.randomInt(0, 10)]
  const d2 = digits[crypto.randomInt(0, 10)]
  const d3 = digits[crypto.randomInt(0, 10)]
  const d4 = digits[crypto.randomInt(0, 10)]

  return `${c1}${v1}${c2}${v2}-${d1}${d2}${d3}${d4}`
}

/**
 * Generate a simple numeric PIN (for parent access etc.)
 */
export function generatePIN(length = 6) {
  return crypto.randomInt(
    Math.pow(10, length - 1),
    Math.pow(10, length)
  ).toString()
}
