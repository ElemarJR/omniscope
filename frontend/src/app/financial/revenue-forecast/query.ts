import { gql } from "@apollo/client";

export const REVENUE_FORECAST_QUERY = gql`
  query RevenueForecast($dateOfInterest: Date!) {
    forecast(dateOfInterest: $dateOfInterest) {
      dateOfInterest
      dates {
        sameDayOneMonthAgo
        oneMonthAgo
        sameDayTwoMonthsAgo
        twoMonthsAgo
        sameDayThreeMonthsAgo
        threeMonthsAgo
      }
      byKind {
        consulting {
          totals {
            inAnalysis
            projected
            expected
            oneMonthAgo
            sameDayOneMonthAgo
            twoMonthsAgo
            sameDayTwoMonthsAgo
            threeMonthsAgo
            sameDayThreeMonthsAgo
          }
          byClient {
            name
            inAnalysis
            projected
            expected
            oneMonthAgo
            sameDayOneMonthAgo
            twoMonthsAgo
            sameDayTwoMonthsAgo
            threeMonthsAgo
            sameDayThreeMonthsAgo
          }
        }
        consultingPre {
          totals {
            inAnalysis
            oneMonthAgo
            twoMonthsAgo
            threeMonthsAgo
          }
          byClient {
            name
            inAnalysis
            oneMonthAgo
            twoMonthsAgo
            threeMonthsAgo
          }
        }
        handsOn {
          totals {
            inAnalysis
            oneMonthAgo
            twoMonthsAgo
            threeMonthsAgo
          }
          byClient {
            name
            inAnalysis
            oneMonthAgo
            twoMonthsAgo
            threeMonthsAgo
          }
        }
        squad {
          totals {
            inAnalysis
            oneMonthAgo
            twoMonthsAgo
            threeMonthsAgo
          }
          byClient {
            name
            inAnalysis
            oneMonthAgo
            twoMonthsAgo
            threeMonthsAgo
          }
        }
      }
    }
  }
`;
