import { LeadScorerService } from './lead-scorer.service';

describe('LeadScorerService', () => {
  let service: LeadScorerService;

  beforeEach(() => {
    service = new LeadScorerService();
  });

  it('adds the no_email opportunity and score when email is missing', () => {
    const result = service.score({
      website: 'https://negocio.com',
      phone: '+54 11 0000-0000',
      instagram: '@negocio',
      googleRating: 4.5,
      googleReviewCount: 50,
    });

    expect(result.opportunities).toContain('no_email');
    expect(result.score).toBeGreaterThanOrEqual(15);
  });

  it('does not add no_email when an email is present', () => {
    const result = service.score({
      website: 'https://negocio.com',
      email: 'hola@negocio.com',
      phone: '+54 11 0000-0000',
      instagram: '@negocio',
      googleRating: 4.5,
      googleReviewCount: 50,
    });

    expect(result.opportunities).not.toContain('no_email');
  });

  it('caps the score at 100 even with every opportunity present', () => {
    const result = service.score({});

    expect(result.score).toBeLessThanOrEqual(100);
  });
});
