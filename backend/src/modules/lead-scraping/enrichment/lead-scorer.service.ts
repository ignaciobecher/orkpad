import { Injectable } from '@nestjs/common';
import { LeadOpportunity } from '../../leads/leads.schema';

export interface LeadScoringInput {
  website?: string;
  phone?: string;
  email?: string;
  instagram?: string;
  facebook?: string;
  googleRating?: number;
  googleReviewCount?: number;
}

export interface LeadScoringResult {
  score: number;
  opportunities: LeadOpportunity[];
}

@Injectable()
export class LeadScorerService {
  score(input: LeadScoringInput): LeadScoringResult {
    let score = 0;
    const opportunities: LeadOpportunity[] = [];

    if (!input.website) {
      score += 30;
      opportunities.push('no_website');
    } else if (input.website.startsWith('http://')) {
      score += 15;
      opportunities.push('no_https');
    }

    if (!input.instagram && !input.facebook) {
      score += 20;
      opportunities.push('no_social');
    }

    if (input.googleRating !== undefined && input.googleRating < 3.5) {
      score += 10;
      opportunities.push('low_rating');
    }

    if (input.googleReviewCount !== undefined && input.googleReviewCount < 10) {
      score += 10;
    }

    if (!input.phone) {
      score += 5;
    }

    if (!input.email) {
      score += 15;
      opportunities.push('no_email');
    }

    return {
      score: Math.min(score, 100),
      opportunities,
    };
  }
}
