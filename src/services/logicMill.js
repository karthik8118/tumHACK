// Logic Mill GraphQL API service for patent search
import fetch from 'node-fetch';
import { config } from '../config.js';

const LOGIC_MILL_API_URL = 'https://logic-mill.net/graphql';
const API_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJBUEkiLCJleHAiOjI2Mjk2NDI4NTUsImlhdCI6MTc1ODczMDg1NSwiaXNzIjoiTE9HSUMtTUlMTCIsImp0aSI6ImU5YThiZWE5LTNlODgtNDUzMS1iOWFiLWY5OGE4YjFhMWFlZCIsIm5iZiI6MTc1ODczMDg1NSwicGF5bG9hZCI6eyJ0b2tlbk5hbWUiOiJEZWZhdWx0IEFQSSBUb2tlbiJ9LCJzdWIiOiJhOTllYTZhMS0wYzFmLTQ4NWQtYjgwMS05OGE3OTBjNzJiY2MifQ.-a6kNDRbl7czFQrnGStFiQfb_Y8ToCUfG3GszgF2q5Q';

export const logicMillService = {
  // Search for similar patents using GraphQL
  async searchPatents(query, limit = 10) {
    try {
      const graphqlQuery = {
        query: `
          query SearchPatents($query: String!, $limit: Int!) {
            searchPatents(query: $query, limit: $limit) {
              id
              title
              abstract
              inventors
              assignee
              publicationDate
              similarityScore
              patentNumber
              classification
              citations
              claims
            }
          }
        `,
        variables: {
          query: query,
          limit: limit
        }
      };

      const response = await fetch(LOGIC_MILL_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_TOKEN}`
        },
        body: JSON.stringify(graphqlQuery)
      });

      if (!response.ok) {
        throw new Error(`Logic Mill API error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(`GraphQL errors: ${result.errors.map(e => e.message).join(', ')}`);
      }

      return result.data.searchPatents || [];
    } catch (error) {
      console.error('Error searching patents:', error);
      throw error;
    }
  },

  // Search for similar publications
  async searchPublications(query, limit = 10) {
    try {
      const graphqlQuery = {
        query: `
          query SearchPublications($query: String!, $limit: Int!) {
            searchPublications(query: $query, limit: $limit) {
              id
              title
              abstract
              authors
              journal
              publicationDate
              similarityScore
              doi
              citations
              keywords
              researchArea
            }
          }
        `,
        variables: {
          query: query,
          limit: limit
        }
      };

      const response = await fetch(LOGIC_MILL_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_TOKEN}`
        },
        body: JSON.stringify(graphqlQuery)
      });

      if (!response.ok) {
        throw new Error(`Logic Mill API error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(`GraphQL errors: ${result.errors.map(e => e.message).join(', ')}`);
      }

      return result.data.searchPublications || [];
    } catch (error) {
      console.error('Error searching publications:', error);
      throw error;
    }
  },

  // Get similarity scores between patents and publications
  async getSimilarityScores(patentId, publicationId) {
    try {
      const graphqlQuery = {
        query: `
          query GetSimilarityScores($patentId: String!, $publicationId: String!) {
            similarityScores(patentId: $patentId, publicationId: $publicationId) {
              patentId
              publicationId
              similarityScore
              semanticSimilarity
              technicalSimilarity
              marketSimilarity
              details {
                commonKeywords
                sharedConcepts
                technicalOverlap
                marketOverlap
              }
            }
          }
        `,
        variables: {
          patentId: patentId,
          publicationId: publicationId
        }
      };

      const response = await fetch(LOGIC_MILL_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_TOKEN}`
        },
        body: JSON.stringify(graphqlQuery)
      });

      if (!response.ok) {
        throw new Error(`Logic Mill API error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(`GraphQL errors: ${result.errors.map(e => e.message).join(', ')}`);
      }

      return result.data.similarityScores;
    } catch (error) {
      console.error('Error getting similarity scores:', error);
      throw error;
    }
  },

  // Analyze research gap based on patent and publication data
  async analyzeResearchGap(startupDescription) {
    try {
      // Search for related patents and publications
      const [patents, publications] = await Promise.all([
        this.searchPatents(startupDescription, 5),
        this.searchPublications(startupDescription, 5)
      ]);

      // Analyze the gap
      const analysis = {
        relatedPatents: patents,
        relatedPublications: publications,
        researchGap: this.calculateResearchGap(patents, publications, startupDescription),
        recommendations: this.generateGapRecommendations(patents, publications)
      };

      return analysis;
    } catch (error) {
      console.error('Error analyzing research gap:', error);
      throw error;
    }
  },

  // Calculate research gap based on existing patents and publications
  calculateResearchGap(patents, publications, description) {
    const keywords = description.toLowerCase().split(/\s+/);
    let gapScore = 10; // Start with high gap (good for innovation)

    // Reduce gap score based on existing patents
    patents.forEach(patent => {
      const patentKeywords = (patent.title + ' ' + patent.abstract).toLowerCase().split(/\s+/);
      const overlap = keywords.filter(word => patentKeywords.includes(word)).length;
      gapScore -= (overlap / keywords.length) * 3; // Reduce gap based on overlap
    });

    // Reduce gap score based on existing publications
    publications.forEach(publication => {
      const pubKeywords = (publication.title + ' ' + publication.abstract).toLowerCase().split(/\s+/);
      const overlap = keywords.filter(word => pubKeywords.includes(word)).length;
      gapScore -= (overlap / keywords.length) * 2; // Publications have less impact than patents
    });

    return Math.max(1, Math.min(10, Math.round(gapScore)));
  },

  // Generate recommendations based on research gap analysis
  generateGapRecommendations(patents, publications) {
    const recommendations = [];

    if (patents.length > 0) {
      recommendations.push('Consider patent landscape analysis to identify freedom to operate');
      recommendations.push('Evaluate potential patent infringement risks');
    }

    if (publications.length > 0) {
      recommendations.push('Review recent academic publications for state-of-the-art');
      recommendations.push('Consider collaboration opportunities with research institutions');
    }

    if (patents.length === 0 && publications.length === 0) {
      recommendations.push('Limited existing research - high innovation potential');
      recommendations.push('Consider early patent filing to protect intellectual property');
    }

    return recommendations;
  }
};
