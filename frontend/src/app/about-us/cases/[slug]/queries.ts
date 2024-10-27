import { gql } from "@apollo/client";
export const GET_CASE_BY_SLUG = gql`
  query GetCaseBySlug($slug: String!) {
    case(slug: $slug) {
      id
      slug
      title
      isActive
      preContractedValue
      sponsor
      hasDescription
      everhourProjectsIds
      startOfContract
      endOfContract
      weeklyApprovedHours
      client {
        name
        logoUrl
      }
      lastUpdate {
        date
        author
        status
        observations
      }
    }
  }
`;