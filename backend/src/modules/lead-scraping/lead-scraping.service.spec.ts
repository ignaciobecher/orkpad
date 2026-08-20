import { LeadScrapingService } from './lead-scraping.service';
import { PlaceResult } from './sources/google-places.source';

describe('LeadScrapingService', () => {
  let service: LeadScrapingService;
  let leadSearchesRepository: any;
  let leadsRepository: any;
  let googlePlacesSource: any;
  let leadScorerService: any;
  let emailFinderService: any;

  const search: any = {
    _id: { toString: () => 'search-1' },
    workspaceId: 'workspace-1',
    query: 'ferreterías',
    location: 'Villa Mercedes',
    maxResults: 20,
  };

  beforeEach(() => {
    leadSearchesRepository = {
      markRunning: jest.fn(),
      markCompleted: jest.fn(),
      markFailed: jest.fn(),
    };
    leadsRepository = {
      findOneBy: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
    };
    googlePlacesSource = { searchBusinesses: jest.fn() };
    leadScorerService = {
      score: jest.fn().mockReturnValue({ score: 50, opportunities: [] }),
    };
    emailFinderService = { findEmail: jest.fn() };

    service = new LeadScrapingService(
      leadSearchesRepository,
      leadsRepository,
      googlePlacesSource,
      leadScorerService,
      emailFinderService,
    );
  });

  it('populates email on leads whose website yields one', async () => {
    const places: PlaceResult[] = [
      { placeId: 'place-1', name: 'Con web', website: 'https://con-web.com' },
    ];
    googlePlacesSource.searchBusinesses.mockResolvedValue(places);
    emailFinderService.findEmail.mockResolvedValue({
      email: 'hola@con-web.com',
      source: 'homepage',
      confidence: 'high',
    });

    await service.processSearch(search);

    expect(leadsRepository.create).toHaveBeenCalledWith(
      'workspace-1',
      expect.objectContaining({
        email: 'hola@con-web.com',
        emailSource: 'homepage',
        emailConfidence: 'high',
      }),
    );
  });

  it('never calls the email finder for places without a website', async () => {
    const places: PlaceResult[] = [{ placeId: 'place-2', name: 'Sin web' }];
    googlePlacesSource.searchBusinesses.mockResolvedValue(places);

    await service.processSearch(search);

    expect(emailFinderService.findEmail).not.toHaveBeenCalled();
    expect(leadsRepository.create).toHaveBeenCalledWith(
      'workspace-1',
      expect.objectContaining({
        email: undefined,
        emailSource: undefined,
        emailConfidence: undefined,
      }),
    );
  });

  it('creates the lead without an email when none is found', async () => {
    const places: PlaceResult[] = [
      {
        placeId: 'place-3',
        name: 'Sin email',
        website: 'https://sin-email.com',
      },
    ];
    googlePlacesSource.searchBusinesses.mockResolvedValue(places);
    emailFinderService.findEmail.mockResolvedValue({});

    await service.processSearch(search);

    expect(leadsRepository.create).toHaveBeenCalledWith(
      'workspace-1',
      expect.objectContaining({ email: undefined }),
    );
  });

  it('does not let a failed email lookup break the whole search', async () => {
    const places: PlaceResult[] = [
      { placeId: 'place-4', name: 'Falla', website: 'https://falla.com' },
    ];
    googlePlacesSource.searchBusinesses.mockResolvedValue(places);
    emailFinderService.findEmail.mockRejectedValue(new Error('timeout'));

    await service.processSearch(search);

    expect(leadSearchesRepository.markFailed).not.toHaveBeenCalled();
    expect(leadsRepository.create).toHaveBeenCalledWith(
      'workspace-1',
      expect.objectContaining({ email: undefined }),
    );
  });
});
