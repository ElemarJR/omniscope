import { gql } from "@apollo/client";

export const GET_CONSULTANT = gql`
  query GetConsultant($slug: String!, $dataset: String!) {
    consultantOrEngineer(slug: $slug) {
      photoUrl
      name
      position

      timesheet(slug: $dataset) {
        byKind {
          consulting {
            uniqueClients
            uniqueSponsors
            uniqueCases
            uniqueWorkers
            totalHours
          }

          handsOn {
            uniqueClients
            uniqueSponsors
            uniqueCases
            uniqueWorkers
            totalHours
          }

          squad {
            uniqueClients
            uniqueSponsors
            uniqueCases
            uniqueWorkers
            totalHours
          }

          internal {
            uniqueClients
            uniqueSponsors
            uniqueCases
            uniqueWorkers
            totalHours
          }
        }

        byCase {
          title
          caseDetails {
            client {
              name
              accountManager {
                name
              }
            }
            sponsor
          }
          byWorker {
            name
            totalConsultingHours
            totalHandsOnHours
            totalSquadHours
            totalInternalHours
          }
        }
      }
    }
  }
`;

export interface Consultant {
  photoUrl: string;
  name: string;
  position: string;

  timesheet: {
    byKind: {
      consulting: {
        uniqueClients: number;
        uniqueSponsors: number;
        uniqueCases: number;
        uniqueWorkers: number;
        totalHours: number;
      };
      handsOn: {
        uniqueClients: number;
        uniqueSponsors: number;
        uniqueCases: number;
        uniqueWorkers: number;
        totalHours: number;
      };
      squad: {
        uniqueClients: number;
        uniqueSponsors: number;
        uniqueCases: number;
        uniqueWorkers: number;
        totalHours: number;
      };
      internal: {
        uniqueClients: number;
        uniqueSponsors: number;
        uniqueCases: number;
        uniqueWorkers: number;
        totalHours: number;
      };
    };
    byCase: Array<{
      title: string;
      caseDetails: {
        client: { name: string; accountManager: { name: string } };
        sponsor: string;
      };
      byWorker: {
        name: string;
        totalConsultingHours: number;
        totalHandsOnHours: number;
        totalSquadHours: number;
        totalInternalHours: number;
      }[];
    }>;
  };
}
