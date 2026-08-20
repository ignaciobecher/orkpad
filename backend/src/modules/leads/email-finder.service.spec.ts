import { EmailFinderService } from './email-finder.service';

describe('EmailFinderService', () => {
  let service: EmailFinderService;
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    service = new EmailFinderService();
    fetchSpy = jest.spyOn(global, 'fetch' as any);
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  function mockHtmlResponse(html: string, ok = true) {
    return {
      ok,
      headers: { get: () => 'text/html; charset=utf-8' },
      text: async () => html,
    } as any;
  }

  it('finds an email from a mailto link on the homepage', async () => {
    fetchSpy.mockResolvedValueOnce(
      mockHtmlResponse('<a href="mailto:hola@negocio.com">Escribinos</a>'),
    );

    const result = await service.findEmail('https://negocio.com');

    expect(result).toEqual({
      email: 'hola@negocio.com',
      source: 'homepage',
      confidence: 'high',
    });
  });

  it('finds an email in plain text when no mailto link exists', async () => {
    fetchSpy.mockResolvedValueOnce(
      mockHtmlResponse('<p>Escribinos a hola@negocio.com para más info</p>'),
    );

    const result = await service.findEmail('https://negocio.com');

    expect(result).toEqual({
      email: 'hola@negocio.com',
      source: 'homepage',
      confidence: 'medium',
    });
  });

  it('falls back to a linked contact page when the homepage has no email', async () => {
    fetchSpy
      .mockResolvedValueOnce(
        mockHtmlResponse('<a href="/contacto">Contacto</a><p>Bienvenidos</p>'),
      )
      .mockResolvedValueOnce(
        mockHtmlResponse('<a href="mailto:info@negocio.com">Mail</a>'),
      );

    const result = await service.findEmail('https://negocio.com');

    expect(result).toEqual({
      email: 'info@negocio.com',
      source: 'contact_page',
      confidence: 'high',
    });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(fetchSpy.mock.calls[1][0]).toBe('https://negocio.com/contacto');
  });

  it('returns empty when no email is found anywhere', async () => {
    fetchSpy.mockResolvedValueOnce(
      mockHtmlResponse('<p>Sin datos de contacto</p>'),
    );

    const result = await service.findEmail('https://negocio.com');

    expect(result).toEqual({});
  });

  it('swallows fetch errors and returns empty', async () => {
    fetchSpy.mockRejectedValueOnce(new Error('network error'));

    const result = await service.findEmail('https://negocio.com');

    expect(result).toEqual({});
  });

  it('rejects candidates that look like image filenames', async () => {
    fetchSpy.mockResolvedValueOnce(
      mockHtmlResponse(
        '<img alt="logo@2x.png"><p>logo@2x.png visto en el sitio</p>',
      ),
    );

    const result = await service.findEmail('https://negocio.com');

    expect(result).toEqual({});
  });

  it('rejects placeholder domains like example.com', async () => {
    fetchSpy.mockResolvedValueOnce(
      mockHtmlResponse('<a href="mailto:test@example.com">Mail</a>'),
    );

    const result = await service.findEmail('https://negocio.com');

    expect(result).toEqual({});
  });

  it('prefers a non-generic address over a generic one on the same page', async () => {
    fetchSpy.mockResolvedValueOnce(
      mockHtmlResponse(
        '<a href="mailto:info@negocio.com">Info</a><a href="mailto:maria@negocio.com">Maria</a>',
      ),
    );

    const result = await service.findEmail('https://negocio.com');

    expect(result.email).toBe('maria@negocio.com');
  });
});
