import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';

export type EmailSource = 'homepage' | 'contact_page' | 'about_page';
export type EmailConfidence = 'high' | 'medium' | 'low';

export interface EmailFinderResult {
  email?: string;
  source?: EmailSource;
  confidence?: EmailConfidence;
}

interface ExtractResult {
  email?: string;
  confidence?: EmailConfidence;
}

const CONTACT_PATH_HINTS = ['contact', 'contacto'];
const ABOUT_PATH_HINTS = ['about', 'nosotros', 'quienes-somos', 'about-us'];

const DOMAIN_BLOCKLIST = [
  'example.com',
  'example.org',
  'sentry.io',
  'wixpress.com',
  'godaddy.com',
  'domain.com',
  'yoursite.com',
  'email.com',
  'sentry.wixpress.com',
];

const GENERIC_LOCAL_PARTS = [
  'info',
  'contact',
  'contacto',
  'admin',
  'webmaster',
  'noreply',
  'no-reply',
  'support',
  'sales',
];

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const IMAGE_EXTENSION_REGEX = /\.(png|jpe?g|gif|svg|webp|woff2?)$/i;
const FETCH_TIMEOUT_MS = 5000;
const MAX_LINKED_PAGES = 2;

@Injectable()
export class EmailFinderService {
  private readonly logger = new Logger(EmailFinderService.name);

  async findEmail(websiteUrl: string): Promise<EmailFinderResult> {
    const normalizedUrl = this.normalizeUrl(websiteUrl);
    if (!normalizedUrl) return {};

    const homeHtml = await this.fetchHtml(normalizedUrl);
    if (!homeHtml) return {};

    const fromHome = this.extractFromHtml(homeHtml);
    if (fromHome.email) {
      return {
        email: fromHome.email,
        source: 'homepage',
        confidence: fromHome.confidence,
      };
    }

    const linkedPages = this.findLinkedPages(homeHtml, normalizedUrl);
    for (const { url, source } of linkedPages) {
      const html = await this.fetchHtml(url);
      if (!html) continue;

      const found = this.extractFromHtml(html);
      if (found.email) {
        return { email: found.email, source, confidence: found.confidence };
      }
    }

    return {};
  }

  private normalizeUrl(url: string): string | undefined {
    if (!url) return undefined;
    try {
      const withScheme = /^https?:\/\//i.test(url) ? url : `https://${url}`;
      return new URL(withScheme).toString();
    } catch {
      return undefined;
    }
  }

  private async fetchHtml(url: string): Promise<string | null> {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; OrkpadLeadBot/1.0)',
        },
      });

      if (!response.ok) return null;

      const contentType = response.headers.get('content-type') ?? '';
      if (!contentType.includes('text/html')) return null;

      return await response.text();
    } catch (err) {
      this.logger.debug(
        `Failed to fetch ${url}: ${err instanceof Error ? err.message : err}`,
      );
      return null;
    }
  }

  private extractFromHtml(html: string): ExtractResult {
    const $ = cheerio.load(html);
    $('script, style, noscript').remove();

    const fromMailto = this.extractFromMailto($);
    if (fromMailto) return { email: fromMailto, confidence: 'high' };

    const fromText = this.extractFromText($.root().text());
    if (fromText) return { email: fromText, confidence: 'medium' };

    return {};
  }

  private extractFromMailto($: cheerio.CheerioAPI): string | undefined {
    const candidates: string[] = [];

    $('a[href^="mailto:"]').each((_, el) => {
      const href = $(el).attr('href') ?? '';
      const email = href
        .replace(/^mailto:/i, '')
        .split('?')[0]
        .trim();
      if (email) candidates.push(email);
    });

    return this.pickBestCandidate(candidates);
  }

  private extractFromText(text: string): string | undefined {
    const matches = text.match(EMAIL_REGEX) ?? [];
    return this.pickBestCandidate(matches);
  }

  private pickBestCandidate(candidates: string[]): string | undefined {
    const plausible = candidates.filter((email) =>
      this.isPlausibleEmail(email),
    );
    if (plausible.length === 0) return undefined;

    const nonGeneric = plausible.find(
      (email) => !this.isGenericLocalPart(email),
    );
    return nonGeneric ?? plausible[0];
  }

  private isGenericLocalPart(email: string): boolean {
    const localPart = email.split('@')[0]?.toLowerCase();
    return GENERIC_LOCAL_PARTS.includes(localPart);
  }

  private isPlausibleEmail(email: string): boolean {
    const normalized = email.toLowerCase();
    const domain = normalized.split('@')[1];
    if (!domain) return false;

    if (DOMAIN_BLOCKLIST.includes(domain)) return false;
    if (IMAGE_EXTENSION_REGEX.test(normalized)) return false;

    return true;
  }

  private findLinkedPages(
    html: string,
    baseUrl: string,
  ): Array<{ url: string; source: EmailSource }> {
    const $ = cheerio.load(html);
    const seen = new Set<string>();
    const pages: Array<{ url: string; source: EmailSource }> = [];

    $('a[href]').each((_, el) => {
      if (pages.length >= MAX_LINKED_PAGES) return;

      const href = $(el).attr('href') ?? '';
      const text = $(el).text().toLowerCase();
      const haystack = `${href.toLowerCase()} ${text}`;

      const source: EmailSource | undefined = CONTACT_PATH_HINTS.some((hint) =>
        haystack.includes(hint),
      )
        ? 'contact_page'
        : ABOUT_PATH_HINTS.some((hint) => haystack.includes(hint))
          ? 'about_page'
          : undefined;

      if (!source) return;

      const resolved = this.resolveUrl(href, baseUrl);
      if (!resolved || seen.has(resolved)) return;

      seen.add(resolved);
      pages.push({ url: resolved, source });
    });

    return pages;
  }

  private resolveUrl(href: string, baseUrl: string): string | undefined {
    try {
      return new URL(href, baseUrl).toString();
    } catch {
      return undefined;
    }
  }
}
