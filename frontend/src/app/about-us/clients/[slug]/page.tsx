"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { GET_CLIENT_BY_SLUG, GET_CLIENT_TIMESHEET } from "./queries";
import { ClientHeader } from "./ClientHeader";
import { Divider } from "@/components/catalyst/divider";
import { CasesGallery } from "../../cases/CasesGallery";
import { AllocationSection } from "./AllocationSection";
import { AllocationCalendar } from "@/app/components/AllocationCalendar";
import SectionHeader from "@/components/SectionHeader";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatType } from "@/app/constants/colors";

interface WorkerSummary {
  worker: string;
  hours: number;
  appointments: any[];
}

const WorkerSummarySection = ({ 
  summaries, 
  selectedStatType 
}: {
  summaries: WorkerSummary[] | null;
  selectedStatType: StatType;
}) => {
  if (!summaries) return null;

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="font-semibold mb-2">Worker Summary:</h3>
      {summaries.map((summary) => (
        <div key={summary.worker} className="flex justify-between items-center py-1">
          <span>{summary.worker}</span>
          <div className="flex items-center gap-4">
            <span>{summary.hours.toFixed(1)}h</span>
            <Sheet>
              <SheetTrigger className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                Details
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>{summary.worker} - {selectedStatType.charAt(0).toUpperCase() + selectedStatType.slice(1)} Hours</SheetTitle>
                </SheetHeader>
                <div className="mt-6 max-h-[60vh] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Date</TableHead>
                        <TableHead className="text-xs">Hours</TableHead>
                        <TableHead className="text-xs">Comment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summary.appointments.map((apt, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium text-xs">{apt.date}</TableCell>
                          <TableCell className="text-xs">{apt.timeInHs}h</TableCell>
                          <TableCell className="text-gray-600 text-xs">{apt.comment}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function ClientPage() {
  const { slug } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedDataset, setSelectedDataset] = useState<string>(
    "timesheet-last-six-weeks"
  );
  const [selectedStat, setSelectedStat] = useState("total");

  // Previous month states
  const [selectedDatePrev, setSelectedDatePrev] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)
  );
  const [selectedDayPrev, setSelectedDayPrev] = useState<number | null>(null);
  const [selectedRowPrev, setSelectedRowPrev] = useState<number | null>(null);
  const [selectedColumnPrev, setSelectedColumnPrev] = useState<number | null>(null);
  const [isAllSelectedPrev, setIsAllSelectedPrev] = useState(false);
  const [selectedStatTypePrev, setSelectedStatTypePrev] = useState<StatType>('consulting');

  // Current month states
  const [selectedDateCurr, setSelectedDateCurr] = useState(new Date());
  const [selectedDayCurr, setSelectedDayCurr] = useState<number | null>(null);
  const [selectedRowCurr, setSelectedRowCurr] = useState<number | null>(null);
  const [selectedColumnCurr, setSelectedColumnCurr] = useState<number | null>(null);
  const [isAllSelectedCurr, setIsAllSelectedCurr] = useState(false);
  const [selectedStatTypeCurr, setSelectedStatTypeCurr] = useState<StatType>('consulting');

  // Calculate visible dates for both datasets
  const getVisibleDates = (date: Date) => {
    const currentMonth = date.getMonth();
    const currentYear = date.getFullYear();

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const startingDayOfWeek = firstDayOfMonth.getDay();
    const firstVisibleDate = new Date(
      currentYear,
      currentMonth,
      -startingDayOfWeek + 1
    );

    const daysInMonth = lastDayOfMonth.getDate();
    const totalDays = startingDayOfWeek + daysInMonth;
    const weeksNeeded = Math.ceil(totalDays / 7);
    const remainingDays = weeksNeeded * 7 - (startingDayOfWeek + daysInMonth);

    const lastVisibleDate = new Date(
      currentYear,
      currentMonth + 1,
      remainingDays
    );

    const formatDate = (date: Date) => {
      return `${date.getDate().toString().padStart(2, "0")}-${(
        date.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}-${date.getFullYear()}`;
    };

    return `${formatDate(firstVisibleDate)}-${formatDate(lastVisibleDate)}`;
  };

  const currentMonthDataset = getVisibleDates(selectedDateCurr);
  const previousMonthDataset = getVisibleDates(selectedDatePrev);

  const {
    data: clientData,
    loading: clientLoading,
    error: clientError,
  } = useQuery(GET_CLIENT_BY_SLUG, {
    variables: { 
      slug,
      dataset1: previousMonthDataset,
      dataset2: currentMonthDataset
    },
  });

  const {
    data: timesheetData,
    loading: timesheetLoading,
    error: timesheetError,
  } = useQuery(GET_CLIENT_TIMESHEET, {
    variables: {
      clientName: clientData?.client?.name,
      datasetSlug: selectedDataset,
    },
    skip: !selectedDataset || !clientData?.client?.name,
  });

  useEffect(() => {
    const datasetParam = searchParams.get("dataset");
    if (datasetParam) {
      setSelectedDataset(datasetParam);
    }
  }, [searchParams]);

  const handleDatasetSelect = (value: string) => {
    setSelectedDataset(value);
    router.push(`/about-us/clients/${slug}?dataset=${value}`);
  };

  const handleStatClick = (statName: string) => {
    setSelectedStat(statName === selectedStat ? "total" : statName);
  };

  const getSelectedWorkerSummary = (timesheet: any, selectedDay: number | null, selectedRow: number | null, selectedColumn: number | null, isAllSelected: boolean, selectedDate: Date, selectedStatType: StatType) => {
    if (!selectedDay && !selectedRow && !selectedColumn && !isAllSelected) return null;

    const workerHours: { [key: string]: { total: number, consulting: number, handsOn: number, squad: number, internal: number } } = {};
    const workerAppointments: { [key: string]: any[] } = {};
    
    timesheet.appointments.forEach((appointment: {
      date: string;
      workerName: string;
      timeInHs: number;
      comment: string;
      kind: string;
    }) => {
      const appointmentDate = new Date(appointment.date);
      const dayOfMonth = appointmentDate.getUTCDate();
      const dayOfWeek = appointmentDate.getUTCDay();
      const appointmentMonth = appointmentDate.getUTCMonth();
      
      const firstDayOfMonth = new Date(appointmentDate.getUTCFullYear(), appointmentDate.getUTCMonth(), 1);
      const firstDayOffset = firstDayOfMonth.getUTCDay();

      const weekIndex = Math.floor((dayOfMonth + firstDayOffset - 1) / 7);

      const shouldInclude = (isAllSelected || 
        (selectedDay !== null && dayOfMonth === selectedDay) ||
        (selectedRow !== null && weekIndex === selectedRow) ||
        (selectedColumn !== null && dayOfWeek === selectedColumn)) &&
        appointmentMonth === selectedDate.getMonth();

      if (shouldInclude) {
        const workerName = appointment.workerName;
        if (!workerHours[workerName]) {
          workerHours[workerName] = {
            total: 0,
            consulting: 0,
            handsOn: 0,
            squad: 0,
            internal: 0
          };
        }

        const dayData = timesheet.byDate.find((d: any) => 
          new Date(d.date).getUTCDate() === dayOfMonth && 
          new Date(d.date).getUTCMonth() === appointmentMonth
        );

        if (dayData) {
          workerHours[workerName].total += appointment.timeInHs;
          
          switch(appointment.kind.toLowerCase()) {
            case 'consulting':
              workerHours[workerName].consulting += appointment.timeInHs;
              break;
            case 'handson':
              workerHours[workerName].handsOn += appointment.timeInHs;
              break;
            case 'squad':
              workerHours[workerName].squad += appointment.timeInHs;
              break;
            case 'internal':
              workerHours[workerName].internal += appointment.timeInHs;
              break;
          }

          if (!workerAppointments[workerName]) {
            workerAppointments[workerName] = [];
          }

          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          workerAppointments[workerName].push({
            ...appointment,
            date: `${days[appointmentDate.getUTCDay()]} ${appointmentDate.getUTCDate()}`
          });
        }
      }
    });

    return Object.entries(workerHours)
      .map(([worker, hours]) => ({
        worker,
        hours: hours[selectedStatType],
        appointments: workerAppointments[worker].filter(apt => 
          apt.kind.toLowerCase() === selectedStatType ||
          (selectedStatType === 'handsOn' && apt.kind.toLowerCase() === 'handson')
        )
      }))
      .filter(summary => summary.hours > 0)
      .sort((a, b) => a.worker.localeCompare(b.worker)); // Changed this line to sort alphabetically by worker name
  };

  if (clientLoading) return <p>Loading client data...</p>;
  if (clientError) return <p>Error loading client: {clientError.message}</p>;
  if (!clientData?.client) return <p>No client data found</p>;

  const { timesheet1, timesheet2 } = clientData.client;

  return (
    <div>
      <ClientHeader client={clientData.client} />

      <SectionHeader title="Side by Side Analysis" subtitle="" />
      
      <div className="ml-2 mr-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <AllocationCalendar
              selectedDate={selectedDatePrev}
              setSelectedDate={setSelectedDatePrev}
              selectedDay={selectedDayPrev}
              setSelectedDay={setSelectedDayPrev}
              selectedRow={selectedRowPrev}
              setSelectedRow={setSelectedRowPrev}
              selectedColumn={selectedColumnPrev}
              setSelectedColumn={setSelectedColumnPrev}
              isAllSelected={isAllSelectedPrev}
              setIsAllSelected={setIsAllSelectedPrev}
              timesheet={timesheet1}
              selectedStatType={selectedStatTypePrev}
              setSelectedStatType={setSelectedStatTypePrev}
            />
            <WorkerSummarySection
              summaries={getSelectedWorkerSummary(
                timesheet1,
                selectedDayPrev,
                selectedRowPrev,
                selectedColumnPrev,
                isAllSelectedPrev,
                selectedDatePrev,
                selectedStatTypePrev
              )}
              selectedStatType={selectedStatTypePrev}
            />
          </div>
          <div>
            <AllocationCalendar
              selectedDate={selectedDateCurr}
              setSelectedDate={setSelectedDateCurr}
              selectedDay={selectedDayCurr}
              setSelectedDay={setSelectedDayCurr}
              selectedRow={selectedRowCurr}
              setSelectedRow={setSelectedRowCurr}
              selectedColumn={selectedColumnCurr}
              setSelectedColumn={setSelectedColumnCurr}
              isAllSelected={isAllSelectedCurr}
              setIsAllSelected={setIsAllSelectedCurr}
              timesheet={timesheet2}
              selectedStatType={selectedStatTypeCurr}
              setSelectedStatType={setSelectedStatTypeCurr}
            />
            <WorkerSummarySection
              summaries={getSelectedWorkerSummary(
                timesheet2,
                selectedDayCurr,
                selectedRowCurr,
                selectedColumnCurr,
                isAllSelectedCurr,
                selectedDateCurr,
                selectedStatTypeCurr
              )}
              selectedStatType={selectedStatTypeCurr}
            />
          </div>
        </div>
      </div>

      <AllocationSection
        selectedDataset={selectedDataset}
        onDatasetSelect={handleDatasetSelect}
        timesheetData={timesheetData}
        timesheetLoading={timesheetLoading}
        timesheetError={timesheetError}
        selectedStat={selectedStat}
        handleStatClick={handleStatClick}
      />

    </div>
  );
}
