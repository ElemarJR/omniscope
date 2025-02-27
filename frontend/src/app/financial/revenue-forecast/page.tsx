"use client";

import { useQuery } from "@apollo/client";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { Option } from "react-tailwindcss-select/dist/components/type";
import { DatePicker } from "@/components/DatePicker";
import { REVENUE_FORECAST_QUERY } from "./query";
import { NavBar } from "@/app/components/NavBar";
import { FilterFieldsSelect } from "../../components/FilterFieldsSelect";
import { RevenueProgression } from "./RevenueProgression";
import { ConsultingTable } from "./ConsultingTable";
import { ConsultingTableByConsultant } from "./ConsultingTableByConsultant";
import { processForecastData } from "./forecastData";
import { OtherTable } from "./OtherTable";
import { ConsultingPreTable } from "./ConsultingPreTable";
import { GraphVizDaily } from "./GraphVizDaily";
import OneYearAllocation from "@/app/components/OneYearAllocation";
import { OnTheTable } from "./OnTheTable";
import { useEdgeClient } from "@/app/hooks/useApolloClient";

export default function RevenueForecastPage() {
  const client = useEdgeClient();
  const [date, setDate] = useState<Date>(new Date());
  const [selectedFilters, setSelectedFilters] = useState<Option[]>([]);
  const [formattedSelectedValues, setFormattedSelectedValues] = useState<
    Array<{ field: string; selectedValues: string[] }>
  >([]);
  const [sortConfigs, setSortConfigs] = useState<
    Record<
      string,
      {
        key: string;
        direction: "asc" | "desc";
      }
    >
  >({
    consulting: { key: "current", direction: "desc" },
    consultingFuture: { key: "realized", direction: "desc" },
    consultingByConsultant: { key: "expectedHistorical", direction: "desc" },
    consultingPre: { key: "current", direction: "desc" },
    handsOn: { key: "current", direction: "desc" },
    squad: { key: "current", direction: "desc" },
  });
  const [expandedClients, setExpandedClients] = useState<
    Record<string, string[]>
  >({
    consulting: [],
    consultingFuture: [],
    consultingPre: [],
    handsOn: [],
    squad: [],
  });
  const [useHistorical, setUseHistorical] = useState<Record<string, boolean>>({
    consulting: false,
    consultingFuture: false,
    consultingPre: false,
    handsOn: false,
    squad: false,
  });
  const [normalized, setNormalized] = useState<Record<string, boolean>>({
    consulting: false,
    consultingFuture: false,
    consultingByConsultant: false,
    consultingPre: false,
    handsOn: false,
    squad: false,
  });

  useEffect(() => {
    const today = new Date();
    setDate(today);
  }, []);

  const handleFilterChange = (value: Option | Option[] | null): void => {
    const newSelectedValues = Array.isArray(value)
      ? value
      : value
      ? [value]
      : [];
    setSelectedFilters(newSelectedValues);

    const formattedValues =
      data?.financial?.revenueForecast?.filterableFields?.reduce((acc: any[], field: any) => {
        const fieldValues = newSelectedValues
          .filter(
            (v) =>
              typeof v.value === "string" &&
              v.value.startsWith(`${field.field}:`)
          )
          .map((v) => (v.value as string).split(":")[1]);

        if (fieldValues.length > 0) {
          acc.push({
            field: field.field,
            selectedValues: fieldValues,
          });
        }
        return acc;
      }, []) || [];

    setFormattedSelectedValues(formattedValues);
  };

  const { loading, error, data } = useQuery(REVENUE_FORECAST_QUERY, {
    variables: {
      date: format(date, "yyyy-MM-dd"),
      filters:
        formattedSelectedValues.length > 0 ? formattedSelectedValues : null,
    },
    client: client ?? undefined,
    ssr: true
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data?.financial?.revenueForecast?.dates) return <div>No data available</div>;

  const forecastData = processForecastData(data);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const requestSort = (key: string, tableId: string) => {
    setSortConfigs((prevConfigs) => {
      const newConfigs = { ...prevConfigs };
      let direction: "asc" | "desc" = "desc";
      if (
        newConfigs[tableId].key === key &&
        newConfigs[tableId].direction === "desc"
      ) {
        direction = "asc";
      }
      newConfigs[tableId] = { key, direction };
      return newConfigs;
    });
  };

  const toggleClient = (clientSlug: string, tableId: string) => {
    setExpandedClients((prev) => {
      const tableClients = prev[tableId] || [];
      const newTableClients = tableClients.includes(clientSlug)
        ? tableClients.filter((slug) => slug !== clientSlug)
        : [...tableClients, clientSlug];

      return {
        ...prev,
        [tableId]: newTableClients,
      };
    });
  };

  return (
    <>
      <div className="relative z-[40]">
        <div className="flex flex-col gap-4">
          <div className="flex items-center">
            <DatePicker date={date} onSelectedDateChange={setDate} />
            <div className="flex-grow h-px bg-gray-200 ml-2"></div>
          </div>

          <FilterFieldsSelect
            data={data?.financial?.revenueForecast}
            selectedFilters={selectedFilters}
            handleFilterChange={handleFilterChange}
          />
        </div>
      </div>

      <div className="ml-2 mr-2">
        <div className="mt-4">
          <RevenueProgression data={data} />
        </div>

        <NavBar
          sections={[
            {
              id: "consulting",
              title: "Consulting",
              subtitle:
                formatCurrency(forecastData.consulting.totals.realized) +
                " / " +
                formatCurrency(forecastData.consulting.totals.expected),
            },
            {
              id: "consultingByConsultant",
              title: "Consulting",
              subtitle: "By Consultant",
            },
            {
              id: "consultingPre",
              title: "Consulting Pre",
              subtitle: formatCurrency(
                forecastData.consultingPre.totals.current
              ),
            },
            {
              id: "handsOn",
              title: "Hands On",
              subtitle: formatCurrency(forecastData.handsOn.totals.current),
            },
            {
              id: "squad",
              title: "Squad",
              subtitle: formatCurrency(forecastData.squad.totals.current),
            },
          ]}
        />

        {/* <div className="mt-4">
          <OneYearAllocation
            kind="consulting"
            hideTotals={true}
            showProjectionGraph={false}
          />
        </div> */}

        <ConsultingTable
          title="Consulting"
          tableData={forecastData.consulting}
          tableId="consulting"
          dates={data.financial.revenueForecast.dates}
          workingDays={data.financial.revenueForecast.workingDays}
          sortConfigs={sortConfigs}
          expandedClients={expandedClients}
          useHistorical={useHistorical}
          normalized={normalized}
          requestSort={requestSort}
          toggleClient={toggleClient}
          setNormalized={setNormalized}
          setUseHistorical={setUseHistorical}
        />

        <GraphVizDaily data={forecastData.daily} />

        <OnTheTable
          title="On the table"
          tableData={forecastData.consulting}
          tableId="onTheTable"
          normalized={normalized}
          useHistorical={useHistorical}
          setUseHistorical={setUseHistorical}
        />

        <ConsultingTableByConsultant
          title="Consulting"
          tableData={forecastData.consulting}
          tableId="consultingByConsultant"
          dates={data.financial.revenueForecast.dates}
          workingDays={data.financial.revenueForecast.workingDays}
          sortConfigs={sortConfigs}
          normalized={normalized}
          requestSort={requestSort}
          setNormalized={setNormalized}
        />

        <ConsultingPreTable
          title="Consulting Pre"
          tableData={forecastData.consultingPre}
          dates={data.financial.revenueForecast.dates}
          sortConfigs={sortConfigs}
          expandedClients={expandedClients}
          requestSort={(key) => requestSort(key, "consultingPre")}
          toggleClient={(clientSlug) => toggleClient(clientSlug, "consultingPre")}
        />

        {/* <div className="mt-4">
          <OneYearAllocation kind="handsOn" hideTotals={true} showProjectionGraph={false} />
        </div> */}

        <OtherTable
          title="Hands On"
          tableData={forecastData.handsOn}
          tableId="handsOn"
          dates={data.financial.revenueForecast.dates}
          sortConfigs={sortConfigs}
          expandedClients={expandedClients}
          requestSort={requestSort}
          toggleClient={toggleClient}
        />

        {/* <div className="mt-4">
          <OneYearAllocation kind="squad" hideTotals={true} showProjectionGraph={false} />
        </div> */}

        <OtherTable
          title="Squad"
          tableData={forecastData.squad}
          tableId="squad"
          dates={data.financial.revenueForecast.dates}
          sortConfigs={sortConfigs}
          expandedClients={expandedClients}
          requestSort={requestSort}
          toggleClient={toggleClient}
        />
      </div>
    </>
  );
}
