import { DailyData } from "@/app/financial/revenue-forecast/forecastData";
import { RevenueTrackingQuery } from "@/app/financial/revenue-tracking/types";
import { gql } from "@apollo/client";

export const GET_ACCOUNT_MANAGER = gql`
  query GetAccountManager(
    $slug: String!
    $dataset: String!
    $dataset1: String!
    $dataset2: String!
  ) {
    accountManager(slug: $slug) {
      photoUrl
      name
      position
      ontologyUrl

      forecast {
        dateOfInterest
        filterableFields {
          field
          options
          selectedValues
        }
        dates {
          sameDayOneMonthAgo
          lastDayOfOneMonthAgo
          sameDayTwoMonthsAgo
          lastDayOfTwoMonthsAgo
          sameDayThreeMonthsAgo
          lastDayOfThreeMonthsAgo
        }
        summary {
          realized
          projected
          expected
          oneMonthAgo
          twoMonthsAgo
          threeMonthsAgo
        }
        daily {
          date
          actual {
            totalConsultingFee
            totalConsultingHours
            accTotalConsultingFee
            accTotalConsultingHours
          }
          expected {
            totalConsultingFee
            totalConsultingHours
            accTotalConsultingFee
            accTotalConsultingHours
          }
          difference {
            totalConsultingFee
            totalConsultingHours
            accTotalConsultingFee
            accTotalConsultingHours
          }
        }
      }

      activeDeals {
        title
        clientOrProspectName
        client {
          id
        }
        stageName
        stageOrderNr
        daysSinceLastUpdate
      }

      cases(onlyActives: true) {
        title
        startOfContract
        endOfContract
        lastUpdated
        hasDescription
        lastUpdate {
          status
          date
          author
          observations
        }
        client {
          name
        }
        isStale
      }

      timesheet1: timesheet(slug: $dataset1) {
        appointments {
          kind
          date
          workerSlug
          workerName
          clientSlug
          clientName
          sponsorSlug
          sponsor
          comment
          timeInHs
        }
        byDate {
          date
          totalHours
          totalConsultingHours
          totalHandsOnHours
          totalSquadHours
          totalInternalHours
        }
        businessCalendar {
          workingDays
          holidays {
            date
            reason
          }
        }
      }

      timesheet2: timesheet(slug: $dataset2) {
        appointments {
          kind
          date
          workerSlug
          workerName
          clientSlug
          clientName
          sponsorSlug
          sponsor
          comment
          timeInHs
        }
        byDate {
          date
          totalHours
          totalConsultingHours
          totalHandsOnHours
          totalSquadHours
          totalInternalHours
        }
        businessCalendar {
          workingDays
          holidays {
            date
            reason
          }
        }
      }

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

    revenueTracking(accountManagerNameOrSlug: $slug) {
      year
      month
      summaries {
        byMode {
          regular
          preContracted
          total
        }
        byKind {
          name
          regular
          preContracted
          total
        }
        byAccountManager {
          name
          slug
          regular
          preContracted
          total
          consultingFee
          consultingPreFee
          handsOnFee
          squadFee
        }
        byClient {
          name
          slug
          regular
          preContracted
          total
          consultingFee
          consultingPreFee
          handsOnFee
          squadFee
        }
        bySponsor {
          name
          slug
          regular
          preContracted
          total
          consultingFee
          consultingPreFee
          handsOnFee
          squadFee
        }
      }
    }
  }
`;

export interface AccountManager {
  photoUrl: string;
  name: string;
  position: string;
  ontologyUrl?: string;

  forecast: {
    dateOfInterest: string;
    filterableFields: Array<{
      field: string;
      options: string[];
      selectedValues: string[];
    }>;
    dates: {
      sameDayOneMonthAgo: string;
      lastDayOfOneMonthAgo: string;
      sameDayTwoMonthsAgo: string;
      lastDayOfTwoMonthsAgo: string;
      sameDayThreeMonthsAgo: string;
      lastDayOfThreeMonthsAgo: string;
    };
    summary: {
      realized: number;
      projected: number;
      expected: number;
      oneMonthAgo: number;
      twoMonthsAgo: number;
      threeMonthsAgo: number;
    };
    daily: DailyData[];
  };

  activeDeals: Array<{
    title: string;
    clientOrProspectName: string;
    client: {
      id: string;
    };
    stageName: string;
    stageOrderNr: number;
    daysSinceLastUpdate: number;
  }>;

  cases: Array<{
    title: string;
    startOfContract: string;
    endOfContract: string;
    lastUpdated: string;
    hasDescription: boolean;
    lastUpdate: {
      status: string;
      date: string;
      author: string;
      observations: string;
    };
    client: {
      name: string;
    };
    isStale: boolean;
  }>;

  timesheet1: {
    appointments: Array<{
      kind: string;
      date: string;
      workerName: string;
      workerSlug: string;
      clientName: string;
      clientSlug: string;
      sponsor: string;
      sponsorSlug: string;
      comment: string;
      timeInHs: number;
    }>;
    byDate: Array<{
      date: string;
      totalHours: number;
      totalConsultingHours: number;
      totalHandsOnHours: number;
      totalSquadHours: number;
      totalInternalHours: number;
    }>;
  };

  timesheet2: {
    appointments: Array<{
      kind: string;
      date: string;
      workerName: string;
      workerSlug: string;
      clientName: string;
      clientSlug: string;
      sponsor: string;
      sponsorSlug: string;
      comment: string;
      timeInHs: number;
    }>;
    byDate: Array<{
      date: string;
      totalHours: number;
      totalConsultingHours: number;
      totalHandsOnHours: number;
      totalSquadHours: number;
      totalInternalHours: number;
    }>;
  };

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
        client: {
          name: string;
          accountManager: {
            name: string;
          };
        };
        sponsor: string;
      };
      byWorker: Array<{
        name: string;
        totalConsultingHours: number;
        totalHandsOnHours: number;
        totalSquadHours: number;
        totalInternalHours: number;
      }>;
    }>;
  };

  revenueTracking: {
    year: number;
    month: number;
    summaries: {
      byMode: {
        regular: number;
        preContracted: number;
        total: number;
      };
      byKind: Array<{
        name: string;
        regular: number;
        preContracted: number;
        total: number;
      }>;
      byAccountManager: Array<{
        name: string;
        slug: string;
        regular: number;
        preContracted: number;
        total: number;
        consultingFee: number;
        consultingPreFee: number;
        handsOnFee: number;
        squadFee: number;
      }>;
      byClient: Array<{
        name: string;
        slug: string;
        regular: number;
        preContracted: number;
        total: number;
        consultingFee: number;
        consultingPreFee: number;
        handsOnFee: number;
        squadFee: number;
      }>;
      bySponsor: Array<{
        name: string;
        slug: string;
        regular: number;
        preContracted: number;
        total: number;
        consultingFee: number;
        consultingPreFee: number;
        handsOnFee: number;
        squadFee: number;
      }>;
    };
  };
}
