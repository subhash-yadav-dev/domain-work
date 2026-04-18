/**
 * Utility functions for URL and domain processing.
 */

/**
 * Extracts a normalized domain from a string.
 * Handles full URLs, partial paths, and bare domains.
 */
export function normalizeDomain(input: string): string {
  let cleaned = input.trim();
  if (!cleaned) return "";

  // Remove protocol
  cleaned = cleaned.replace(/^(https?:\/\/)?(www\.)?/, "");

  // Remove path, query params, hash
  cleaned = cleaned.split(/[/?#]/)[0];

  return cleaned.toLowerCase();
}

/**
 * Extracts all unique normalized domains from a bulk text input.
 */
export function extractDomains(text: string): string[] {
  const lines = text.split(/\n|,/);
  const domains = new Set<string>();

  lines.forEach((line) => {
    const domain = normalizeDomain(line);
    if (domain && domain.includes(".")) {
      domains.add(domain);
    }
  });

  return Array.from(domains);
}

/**
 * Filters a list of URLs/Strings based on a list of target domains.
 * @param inputs List of URLs or strings to filter
 * @param domains List of domains to match against
 * @param mode 'include' to keep matches, 'exclude' to remove matches
 */
export function filterByDomains(
  inputs: string[],
  domains: string[],
  mode: 'include' | 'exclude'
): string[] {
  const normalizedDomains = new Set(domains.map(d => normalizeDomain(d)));
  
  return inputs.filter(input => {
    const domain = normalizeDomain(input);
    const isMatch = normalizedDomains.has(domain);
    return mode === 'include' ? isMatch : !isMatch;
  });
}
