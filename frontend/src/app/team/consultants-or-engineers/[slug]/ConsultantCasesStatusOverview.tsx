import React, { useEffect } from "react";
import { useQueryBuilder } from "@/lib/graphql/QueryBuilderContext";
import { usePageQuery } from "@/lib/graphql/usePageQuery";
import SectionHeader from "@/components/SectionHeader";
import Link from "next/link";

type Case = {
  title: string;
  slug: string;
};

type ConsultantCasesStatusData = {
  team: {
    consultantOrEngineer: {
      staleliness: {
        upToDateCases: {
          data: Case[];
        };
        staleInLessThan15DaysCases: {
          data: Case[];
        };
        staleInOneWeekCases: {
          data: Case[];
        };
        staleCases: {
          data: Case[];
        };
      };
    };
  };
};

const CaseStatusCard = ({
  title,
  cases,
  color,
}: {
  title: string;
  cases: Case[];
  color: string;
}) => (
  <div>
    <div>
      <SectionHeader
        title={title}
        subtitle={`${cases.length} ${cases.length === 1 ? "case" : "cases"}`}
      />
    </div>
    <ol className="list-decimal pl-4 space-y-1 text-[10px]">
      {cases.map((c, i) => (
        <li key={i} className="leading-[1.25]">
          <Link
            href={`/about-us/cases/${c.slug}`}
            className="text-[10px] text-blue-600 hover:text-blue-800 hover:underline"
          >
            {c.title}
          </Link>
        </li>
      ))}
    </ol>
  </div>
);

export function ConsultantCasesStatusOverview() {
  const { addFragment } = useQueryBuilder();

  useEffect(() => {
    addFragment({
      id: "consultantCasesStatus",
      fragment: `
        team {
          consultantOrEngineer(slug: $slug) {
            staleliness {
              upToDateCases {
                data {
                  title
                  slug
                }
              }
              staleInLessThan15DaysCases {
                data {
                  title
                  slug
                }
              }
              staleInOneWeekCases {
                data {
                  title
                  slug
                }
              }
              staleCases {
                data {
                  title
                  slug
                }
              }
            }
          }
        }
      `,
    });
  }, [addFragment]);

  const { data, loading } = usePageQuery<ConsultantCasesStatusData>();

  if (loading || !data?.team?.consultantOrEngineer?.staleliness) return null;

  const { staleliness } = data.team.consultantOrEngineer;

  return (
    <div className="mb-8">
      <SectionHeader title="Cases Status Overview" subtitle="" />
      <div className="ml-2 mr-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <CaseStatusCard
          title="Up to Date Cases"
          cases={staleliness.upToDateCases.data}
          color="text-green-600"
        />
        <CaseStatusCard
          title="Stale in Less Than 15 Days"
          cases={staleliness.staleInLessThan15DaysCases.data}
          color="text-yellow-600"
        />
        <CaseStatusCard
          title="Stale in One Week"
          cases={staleliness.staleInOneWeekCases.data}
          color="text-yellow-600"
        />
        <CaseStatusCard
          title="Stale Cases"
          cases={staleliness.staleCases.data}
          color="text-red-600"
        />
      </div>
    </div>
  );
}
