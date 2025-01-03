"use client";

import { useLazyQuery } from "@apollo/client";
import { useState, useEffect } from "react";
import { Heading } from "@/components/catalyst/heading";
import { Divider } from "@/components/catalyst/divider";
import Select from "react-tailwindcss-select";
import { SelectValue } from "react-tailwindcss-select/dist/components/type";
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { GET_TIMESHEET, GET_ONTOLOGY, GET_INSIGHTS } from '../datasetQueries';
import TimesheetData from '../TimesheetData';
import OntologyData from '../OntologyData';
import InsightsData from '../InsightsData';
import DatasetSelector from '../DatasetSelector';

export default function Datasets() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const defaultDataset = 'timesheet-this-month';
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [selectedValues, setSelectedValues] = useState<SelectValue[]>([]);
  const [formattedSelectedValues, setFormattedSelectedValues] = useState<Array<{field: string, selectedValues: string[]}>>([]);
  const [filterableFields, setFilterableFields] = useState<any[]>([]);

  const [getFilteredTimesheet, { loading: timesheetLoading, error: timesheetError, data: timesheetData }] = useLazyQuery(GET_TIMESHEET);
  const [getFilteredOntology, { loading: ontologyLoading, error: ontologyError, data: ontologyData }] = useLazyQuery(GET_ONTOLOGY);
  const [getFilteredInsights, { loading: insightsLoading, error: insightsError, data: insightsData }] = useLazyQuery(GET_INSIGHTS);

  useEffect(() => {
    const slug = params.slug && params.slug.length > 0 ? params.slug[0] : defaultDataset;
    setSelectedDataset(slug);
  }, [params.slug]);

  useEffect(() => {
    if (selectedDataset) {
      const queryString = new URLSearchParams(searchParams).toString();
      router.push(`/analytics/datasets/${selectedDataset}${queryString ? `?${queryString}` : ''}`);
    } else {
      router.push(`/analytics/datasets`);
    }
  }, [selectedDataset, router, searchParams]);

  useEffect(() => {
    const filters = parseFiltersFromSearchParams(searchParams);
    setFormattedSelectedValues(filters);

    const newSelectedValues = filters.flatMap(filter => 
      filter.selectedValues.map(value => ({
        value: `${filter.field}:${value}`,
        label: value
      }))
    );
    setSelectedValues(newSelectedValues);
  }, [searchParams]);

  useEffect(() => {
    if (selectedDataset) {
      const filters = formattedSelectedValues.length > 0 ? formattedSelectedValues : null;
      if (selectedDataset.startsWith('timesheet')) {
        getFilteredTimesheet({
          variables: {
            slug: selectedDataset,
            filters: filters
          }
        });
      } else if (selectedDataset.startsWith('ontology')) {
        getFilteredOntology({
          variables: {
            slug: selectedDataset,
            filters: filters
          }
        });
      } else if (selectedDataset.startsWith('insights')) {
        getFilteredInsights({
          variables: {
            slug: selectedDataset,
            filters: filters
          }
        });
      }
    }
  }, [formattedSelectedValues, selectedDataset, getFilteredTimesheet, getFilteredOntology, getFilteredInsights]);

  useEffect(() => {
    if (timesheetData?.timesheet?.filterableFields) {
      setFilterableFields(timesheetData.timesheet.filterableFields);
    } else if (ontologyData?.ontology?.filterableFields) {
      setFilterableFields(ontologyData.ontology.filterableFields);
    } else if (insightsData?.insights?.filterableFields) {
      setFilterableFields(insightsData.insights.filterableFields);
    }
  }, [timesheetData, ontologyData, insightsData]);

  const updateQueryString = (newSelectedValues: SelectValue[]) => {
    const params = new URLSearchParams();
    const uniqueFilters: Record<string, Set<string>> = {};
    
    newSelectedValues.forEach(value => {
      if (value && 'value' in value && typeof value.value === 'string') {
        const [field, fieldValue] = value.value.split(':');
        if (field && fieldValue) {
          if (!uniqueFilters[field]) {
            uniqueFilters[field] = new Set();
          }
          uniqueFilters[field].add(fieldValue);
        }
      }
    });

    Object.entries(uniqueFilters).forEach(([field, values]) => {
      values.forEach(value => params.append(field, value));
    });

    router.push(`/analytics/datasets/${selectedDataset}?${params.toString()}`);
  };

  function parseFiltersFromSearchParams(searchParams: URLSearchParams): Array<{ field: string; selectedValues: string[] }> {
    const filters: Record<string, Set<string>> = {};
    searchParams.forEach((value, key) => {
      if (!filters[key]) filters[key] = new Set();
      filters[key].add(value);
    });
    return Object.entries(filters).map(([field, selectedValues]) => ({ field, selectedValues: Array.from(selectedValues) }));
  }

  const handleDatasetSelect = (value: string) => {
    setSelectedDataset(value);
    setSelectedValues([]);
    setFormattedSelectedValues([]);
  };

  return (
    <>
      <DatasetSelector
        selectedDataset={selectedDataset}
        onDatasetSelect={handleDatasetSelect}
      />

      <div className="mt-2 mb-2">
        <form>
          <Select
            value={selectedValues as SelectValue}
            options={filterableFields.map((f: any) => ({
              label: String(f.field ?? 'Unknown Field'),
              options: Array.from(new Set((f.options || [])
                .filter((o: unknown) => o != null)
                .map((o: unknown) => String(o))))
                .map((o: unknown) => ({
                  value: `${f.field}:${o}`,
                  label: String(o),
                }))
            }))}
            placeholder="Filters..."
            onChange={(value: unknown | unknown[]): void => {
              const newSelectedValues = Array.isArray(value) ? value : [];
              setSelectedValues(newSelectedValues);
              updateQueryString(newSelectedValues);
              
              const formattedValues = filterableFields.reduce((acc: any[], field: any) => {
                const fieldValues = new Set(newSelectedValues
                  .filter(v => typeof v.value === 'string' && v.value.startsWith(`${field.field}:`))
                  .map(v => (v.value as string).split(':')[1]));
                
                if (fieldValues.size > 0) {
                  acc.push({
                    field: field.field,
                    selectedValues: Array.from(fieldValues)
                  });
                }
                return acc;
              }, []);
              
              setFormattedSelectedValues(formattedValues);
            }}
            primaryColor={""}
            isMultiple={true}
            isSearchable={true}
            isClearable={true}
            formatGroupLabel={(data) => (
              <div className={`py-2 text-xs flex items-center justify-between`}>
                <span className="font-bold uppercase">
                  {data.label
                    .replace(/([A-Z])/g, ' $1')
                    .trim()
                    .replace(/(Name|Title)$/, '')}
                </span>
                <span className="bg-gray-200 h-5 h-5 p-1.5 flex items-center justify-center rounded-full">
                  {data.options.length}
                </span>
              </div>
            )}
          />
        </form>
      </div>

      {selectedDataset && (
        <>
          {(timesheetLoading || ontologyLoading || insightsLoading) && <p className="text-center py-5">Loading...</p>}
          {(timesheetError || ontologyError || insightsError) && (
            <p className="text-center py-5 text-red-500">
              Error: {timesheetError?.message || ontologyError?.message || insightsError?.message}
            </p>
          )}
          {timesheetData && timesheetData.timesheet && selectedDataset.startsWith('timesheet') && (
            <TimesheetData
              filteredData={timesheetData}
            />
          )}
          {ontologyData && ontologyData.ontology && selectedDataset.startsWith('ontology') && (
            <OntologyData
              ontologyData={ontologyData}
            />
          )}
          {insightsData && insightsData.insights && selectedDataset.startsWith('insights') && (
            <InsightsData
              insightsData={insightsData}
            />
          )}
        </>
      )}
    </>
  );
}
