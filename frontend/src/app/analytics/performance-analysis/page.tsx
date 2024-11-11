"use client";

import { useQuery } from "@apollo/client";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { DatePicker } from "@/components/DatePicker";
import { PERFORMANCE_ANALYSIS_QUERY } from "./query";
import { RegularCasesTable } from "./RegularCasesTable";
import { PreContractedCasesTable } from "./PreContractedCasesTable";
import { RegularCasesByClientTable } from "./RegularCasesByClientTable";
import { PreContractedCasesByClientTable } from "./PreContractedCasesByClientTable";

interface Case {
  accountManager: string;
  client: string;
  sponsor: string;
}

interface Week {
  regularCases: Case[];
  preContractedCases: Case[];
  start: string;
}

export default function PerformanceAnalysisPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [expandedRegularManagers, setExpandedRegularManagers] = useState<
    Set<string>
  >(new Set());
  const [expandedPreContractedManagers, setExpandedPreContractedManagers] =
    useState<Set<string>>(new Set());
  const [expandedClients, setExpandedClients] = useState<Set<string>>(
    new Set()
  );
  const [expandedSponsors, setExpandedSponsors] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    const today = new Date();
    setDate(today);
  }, []);

  const firstDayOfMonth = new Date(date);
  firstDayOfMonth.setDate(1);
  const defaultDate = format(firstDayOfMonth, "yyyy-MM-dd");

  const { loading, error, data } = useQuery(PERFORMANCE_ANALYSIS_QUERY, {
    variables: { date: defaultDate },
    onCompleted: (data) => {
      console.log("Query data:", data); // Debug
    },
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Helper function to format hours
  const formatHours = (hours: number) => {
    return Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`;
  };

  // Get unique account managers and sort them
  const accountManagers = Array.from(
    new Set<string>(
      data.performanceAnalysis.weeks.flatMap((week: any) => [
        ...week.regularCases.map((c: any) => c.accountManager),
        ...week.preContractedCases.map((c: any) => c.accountManager),
      ])
    )
  ).sort();

  // Get unique clients and sort them
  const clients = Array.from(
    new Set<string>(
      data.performanceAnalysis.weeks.flatMap((week: any) =>
        week.regularCases.map((c: any) => c.client)
      )
    )
  ).sort();

  // Get unique precontracted clients and sort them
  const preContractedClients = Array.from(
    new Set<string>(
      data.performanceAnalysis.weeks.flatMap((week: any) =>
        week.preContractedCases.map((c: any) => c.client)
      )
    )
  ).sort();

  const toggleRegularManager = (manager: string) => {
    const newExpanded = new Set(expandedRegularManagers);
    if (newExpanded.has(manager)) {
      newExpanded.delete(manager);
    } else {
      newExpanded.add(manager);
    }
    setExpandedRegularManagers(newExpanded);
  };

  const togglePreContractedManager = (manager: string) => {
    const newExpanded = new Set(expandedPreContractedManagers);
    if (newExpanded.has(manager)) {
      newExpanded.delete(manager);
    } else {
      newExpanded.add(manager);
    }
    setExpandedPreContractedManagers(newExpanded);
  };

  const toggleClient = (clientKey: string) => {
    console.log("Toggling client:", clientKey); // Debug
    const newExpanded = new Set(expandedClients);
    if (newExpanded.has(clientKey)) {
      newExpanded.delete(clientKey);
    } else {
      newExpanded.add(clientKey);
    }
    setExpandedClients(newExpanded);
  };

  const toggleSponsor = (sponsorKey: string) => {
    console.log("Toggling sponsor:", sponsorKey); // Debug
    const newExpanded = new Set(expandedSponsors);
    if (newExpanded.has(sponsorKey)) {
      newExpanded.delete(sponsorKey);
    } else {
      newExpanded.add(sponsorKey);
    }
    setExpandedSponsors(newExpanded);
  };

  const getClientsForManager = (
    week: Week,
    managerName: string,
    isRegular: boolean
  ): string[] => {
    const cases = isRegular ? week.regularCases : week.preContractedCases;
    return Array.from(
      new Set(
        cases
          .filter((c) => c.accountManager === managerName)
          .map((c) => c.client)
      )
    ).sort();
  };

  // Função para RegularCasesByClientTable
  const getSponsorsForClientSimple = (
    week: Week,
    clientName: string,
    isRegular: boolean
  ): string[] => {
    const cases = isRegular ? week.regularCases : week.preContractedCases;
    return Array.from(
      new Set(
        cases.filter((c) => c.client === clientName).map((c) => c.sponsor)
      )
    ).sort();
  };

  // Função para RegularCasesTable
  const getSponsorsForClientWithManager = (
    week: Week,
    managerName: string,
    clientName: string,
    isRegular: boolean
  ): string[] => {
    const cases = isRegular ? week.regularCases : week.preContractedCases;
    return Array.from(
      new Set(
        cases
          .filter(
            (c) => c.accountManager === managerName && c.client === clientName
          )
          .map((c) => c.sponsor)
      )
    ).sort();
  };

  const selectedWeekIndex = data.performanceAnalysis.weeks.findIndex(
    (week: Week) => {
      const weekStart = new Date(week.start);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      return date >= weekStart && date < weekEnd;
    }
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <DatePicker date={date} onSelectedDateChange={setDate} />
        <div className="flex-grow h-px bg-gray-200 ml-2"></div>
      </div>
      <div className="space-y-8 ml-2 mr-2">
        <RegularCasesTable
          data={data}
          accountManagers={accountManagers}
          expandedRegularManagers={expandedRegularManagers}
          expandedClients={expandedClients}
          selectedWeekIndex={selectedWeekIndex}
          expandedSponsors={expandedSponsors}
          toggleRegularManager={toggleRegularManager}
          toggleClient={toggleClient}
          toggleSponsor={toggleSponsor}
          getClientsForManager={getClientsForManager}
          getSponsorsForClient={getSponsorsForClientWithManager}
          formatHours={formatHours}
        />

        <RegularCasesByClientTable
          data={data}
          clients={clients}
          expandedClients={expandedClients}
          expandedSponsors={expandedSponsors}
          selectedWeekIndex={selectedWeekIndex}
          toggleClient={toggleClient}
          toggleSponsor={toggleSponsor}
          getSponsorsForClient={getSponsorsForClientSimple}
          formatHours={formatHours}
        />

        <PreContractedCasesTable
          data={data}
          accountManagers={accountManagers}
          expandedPreContractedManagers={expandedPreContractedManagers}
          expandedClients={expandedClients}
          selectedWeekIndex={selectedWeekIndex}
          expandedSponsors={expandedSponsors}
          togglePreContractedManager={togglePreContractedManager}
          toggleClient={toggleClient}
          toggleSponsor={toggleSponsor}
          getClientsForManager={getClientsForManager}
          getSponsorsForClient={getSponsorsForClientWithManager}
          formatHours={formatHours}
        />

        <PreContractedCasesByClientTable
          data={data}
          clients={preContractedClients}
          expandedClients={expandedClients}
          expandedSponsors={expandedSponsors}
          selectedWeekIndex={selectedWeekIndex}
          toggleClient={toggleClient}
          toggleSponsor={toggleSponsor}
          getSponsorsForClient={getSponsorsForClientSimple}
          formatHours={formatHours}
        />
      </div>
    </div>
  );
}
