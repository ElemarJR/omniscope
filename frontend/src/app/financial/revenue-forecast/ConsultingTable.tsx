import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table";
import SectionHeader from "@/components/SectionHeader";
import React from "react";
import { TableHeaderComponent } from "./components/TableHeader";
import { TableRowComponent } from "./components/TableRow";
import { TableCellComponent } from "./components/TableCell";
import { formatCurrency } from "./utils";

interface ConsultingTableProps {
  title: string;
  tableData: any;
  tableId: string;
  dates: any;
  workingDays: any;
  sortConfigs: Record<string, { key: string; direction: "asc" | "desc" }>;
  expandedClients: Record<string, string[]>;
  useHistorical: Record<string, boolean>;
  normalized: Record<string, boolean>;
  requestSort: (key: string, tableId: string) => void;
  toggleClient: (clientSlug: string, tableId: string) => void;
  setNormalized: (value: React.SetStateAction<Record<string, boolean>>) => void;
  setUseHistorical: (
    value: React.SetStateAction<Record<string, boolean>>
  ) => void;
}

export function ConsultingTable({
  title,
  tableData,
  tableId,
  dates,
  workingDays,
  sortConfigs,
  expandedClients,
  useHistorical,
  normalized,
  requestSort,
  toggleClient,
  setNormalized,
  setUseHistorical,
}: ConsultingTableProps) {
  const sortedClients = getSortedClients(tableData.clients, tableId);
  const total = tableData.totals;

  function getSortedClients(clients: any[], tableId: string) {
    const sortConfig = sortConfigs[tableId];
    if (!sortConfig?.key) return clients;

    return [...clients].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }

  return (
    <div id={tableId} className="mt-8 scroll-mt-[68px] sm:scroll-mt-[68px]">
      <div className="flex justify-between items-center">
        <SectionHeader
          title={title}
          subtitle={`${formatCurrency(total.realized)} / ${formatCurrency(
            useHistorical[tableId] ? total.expectedHistorical : total.expected
          )}`}
        />
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Normalized</span>
          <button
            onClick={() =>
              setNormalized((prev) => ({
                ...prev,
                [tableId]: !prev[tableId],
              }))
            }
            className={`
              w-12 h-6 rounded-full transition-colors duration-200 ease-in-out
              ${normalized[tableId] ? "bg-blue-600" : "bg-gray-200"}
              relative
            `}
          >
            <span
              className={`
                absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out
                ${normalized[tableId] ? "transform translate-x-6" : ""}
              `}
            />
          </button>
        </div>
      </div>
      <div className="px-2">
        <Table>
          <TableHeaderComponent
            dates={dates}
            workingDays={workingDays}
            tableId={tableId}
            normalized={normalized}
            sortConfigs={sortConfigs}
            useHistorical={useHistorical}
            requestSort={requestSort}
            setUseHistorical={setUseHistorical}
          />
          <TableBody>
            {sortedClients.map((client: any, index: number) => (
              <React.Fragment key={client.slug}>
                <TableRowComponent
                  item={client}
                  index={index + 1}
                  total={total}
                  tableId={tableId}
                  normalized={normalized}
                  useHistorical={useHistorical}
                  expandedClients={expandedClients}
                  toggleClient={toggleClient}
                />
                {expandedClients[tableId]?.includes(client.slug) &&
                  tableData.sponsors
                    .filter(
                      (sponsor: any) => sponsor.clientSlug === client.slug
                    )
                    .map((sponsor: any) => (
                      <React.Fragment key={sponsor.slug}>
                        <TableRowComponent
                          item={sponsor}
                          index={null}
                          depth={1}
                          total={total}
                          tableId={tableId}
                          normalized={normalized}
                          useHistorical={useHistorical}
                          expandedClients={expandedClients}
                          toggleClient={toggleClient}
                        />
                        {expandedClients[tableId]?.includes(sponsor.slug) &&
                          tableData.cases
                            .filter(
                              (caseItem: any) =>
                                caseItem.sponsorSlug === sponsor.slug
                            )
                            .map((caseItem: any) => (
                              <React.Fragment key={caseItem.slug}>
                                <TableRowComponent
                                  item={caseItem}
                                  depth={2}
                                  total={total}
                                  tableId={tableId}
                                  normalized={normalized}
                                  useHistorical={useHistorical}
                                  expandedClients={expandedClients}
                                  toggleClient={toggleClient}
                                />
                                {expandedClients[tableId]?.includes(
                                  caseItem.slug
                                ) &&
                                  tableData.projects
                                    .filter(
                                      (project: any) =>
                                        project.caseSlug === caseItem.slug
                                    )
                                    .map((project: any) => (
                                      <React.Fragment key={project.slug}>
                                        <TableRowComponent
                                          item={project}
                                          depth={3}
                                          total={total}
                                          tableId={tableId}
                                          normalized={normalized}
                                          useHistorical={useHistorical}
                                          expandedClients={expandedClients}
                                          toggleClient={toggleClient}
                                        />
                                      </React.Fragment>
                                    ))}
                              </React.Fragment>
                            ))}
                      </React.Fragment>
                    ))}
              </React.Fragment>
            ))}
            <TableRow className="font-bold border-t-4 h-[57px]">
              <TableCell className="text-right pr-4"></TableCell>
              <TableCell className="border-r border-gray-400">Total</TableCell>
              <TableCellComponent
                value={total.sameDayThreeMonthsAgo}
                normalizedValue={total.normalizedSameDayThreeMonthsAgo}
                totalValue={total.sameDayThreeMonthsAgo}
                normalizedTotalValue={total.normalizedSameDayThreeMonthsAgo}
                hours={total.sameDayThreeMonthsAgoConsultingHours}
                normalizedHours={total.normalizedSameDayThreeMonthsAgoConsultingHours}
                className="border-x border-gray-200 text-[12px]"
                normalized={normalized[tableId]}
              />
              <TableCellComponent
                value={total.threeMonthsAgo}
                normalizedValue={total.normalizedThreeMonthsAgo}
                totalValue={total.threeMonthsAgo}
                normalizedTotalValue={total.normalizedThreeMonthsAgo}
                hours={total.threeMonthsAgoConsultingHours}
                normalizedHours={total.normalizedThreeMonthsAgoConsultingHours}
                className="border-r border-gray-400 text-[12px]"
                normalized={normalized[tableId]}
              />
              <TableCellComponent
                value={total.sameDayTwoMonthsAgo}
                normalizedValue={total.normalizedSameDayTwoMonthsAgo}
                totalValue={total.sameDayTwoMonthsAgo}
                normalizedTotalValue={total.normalizedSameDayTwoMonthsAgo}
                hours={total.sameDayTwoMonthsAgoConsultingHours}
                normalizedHours={total.normalizedSameDayTwoMonthsAgoConsultingHours}
                className="border-x border-gray-200 text-[12px]"
                normalized={normalized[tableId]}
                previousValue={total.sameDayThreeMonthsAgo}
                normalizedPreviousValue={total.normalizedSameDayThreeMonthsAgo}
              />
              <TableCellComponent
                value={total.twoMonthsAgo}
                normalizedValue={total.normalizedTwoMonthsAgo}
                totalValue={total.twoMonthsAgo}
                normalizedTotalValue={total.normalizedTwoMonthsAgo}
                hours={total.twoMonthsAgoConsultingHours}
                normalizedHours={total.normalizedTwoMonthsAgoConsultingHours}
                className="border-r border-gray-400 text-[12px]"
                normalized={normalized[tableId]}
                previousValue={total.threeMonthsAgo}
                normalizedPreviousValue={total.normalizedThreeMonthsAgo}
              />
              <TableCellComponent
                value={total.sameDayOneMonthAgo}
                normalizedValue={total.normalizedSameDayOneMonthAgo}
                totalValue={total.sameDayOneMonthAgo}
                normalizedTotalValue={total.normalizedSameDayOneMonthAgo}
                hours={total.sameDayOneMonthAgoConsultingHours}
                normalizedHours={total.normalizedSameDayOneMonthAgoConsultingHours}
                className="border-x border-gray-200 text-[12px]"
                normalized={normalized[tableId]}
                previousValue={total.sameDayTwoMonthsAgo}
                normalizedPreviousValue={total.normalizedSameDayTwoMonthsAgo}
              />
              <TableCellComponent
                value={total.oneMonthAgo}
                normalizedValue={total.normalizedOneMonthAgo}
                totalValue={total.oneMonthAgo}
                normalizedTotalValue={total.normalizedOneMonthAgo}
                hours={total.oneMonthAgoConsultingHours}
                normalizedHours={total.normalizedOneMonthAgoConsultingHours}
                className="border-r border-gray-400 text-[12px]"
                normalized={normalized[tableId]}
                previousValue={total.twoMonthsAgo}
                normalizedPreviousValue={total.normalizedTwoMonthsAgo}
              />
              <TableCellComponent
                value={total.realized}
                normalizedValue={total.normalizedRealized}
                totalValue={total.realized}
                normalizedTotalValue={total.normalizedRealized}
                hours={total.inAnalysisConsultingHours}
                normalizedHours={total.normalizedInAnalysisConsultingHours}
                className="border-x border-gray-200"
                normalized={normalized[tableId]}
                previousValue={total.sameDayOneMonthAgo}
                normalizedPreviousValue={total.normalizedSameDayOneMonthAgo}
              />
              <TableCellComponent
                value={total.projected}
                normalizedValue={total.normalizedProjected}
                totalValue={total.projected}
                normalizedTotalValue={total.normalizedProjected}
                className="border-x border-gray-200"
                normalized={normalized[tableId]}
                projected={total.projected}
                normalizedProjected={total.normalizedProjected}
                expected={
                  useHistorical[tableId]
                    ? total.expectedHistorical
                    : total.expected
                }
                normalizedExpected={
                  useHistorical[tableId]
                    ? total.normalizedExpectedHistorical
                    : total.normalizedExpected
                }
                previousValue={total.oneMonthAgo}
                normalizedPreviousValue={total.normalizedOneMonthAgo}
              />
              <TableCellComponent
                value={
                  useHistorical[tableId]
                    ? total.expectedHistorical
                    : total.expected
                }
                normalizedValue={
                  useHistorical[tableId]
                    ? total.normalizedExpectedHistorical
                    : total.normalizedExpected
                }
                totalValue={
                  useHistorical[tableId]
                    ? total.expectedHistorical
                    : total.expected
                }
                normalizedTotalValue={
                  useHistorical[tableId]
                    ? total.normalizedExpectedHistorical
                    : total.normalizedExpected
                }
                className="border-r border-gray-400"
                normalized={normalized[tableId]}
                projected={total.projected}
                normalizedProjected={total.normalizedProjected}
                expected={
                  useHistorical[tableId]
                    ? total.expectedHistorical
                    : total.expected
                }
                normalizedExpected={
                  useHistorical[tableId]
                    ? total.normalizedExpectedHistorical
                    : total.normalizedExpected
                }
                previousValue={total.oneMonthAgo}
                normalizedPreviousValue={total.normalizedOneMonthAgo}
              />
            </TableRow>
            <TableRow className="text-gray-600 border-t h-[57px]">
              <TableCell className="text-right pr-4"></TableCell>
              <TableCell className="border-r border-gray-400">
                New Cases
              </TableCell>
              <TableCellComponent
                value={total.sameDayThreeMonthsAgoConsultingFeeNew || 0}
                normalizedValue={
                  (total.sameDayThreeMonthsAgoConsultingFeeNew || 0) /
                  workingDays.sameDayThreeMonthsAgo
                }
                totalValue={total.sameDayThreeMonthsAgo}
                normalizedTotalValue={total.normalizedSameDayThreeMonthsAgo}
                className="border-x border-gray-200 text-[12px]"
                normalized={normalized[tableId]}
              />
              <TableCellComponent
                value={total.threeMonthsAgoConsultingFeeNew || 0}
                normalizedValue={
                  (total.threeMonthsAgoConsultingFeeNew || 0) /
                  workingDays.threeMonthsAgo
                }
                totalValue={total.threeMonthsAgo}
                normalizedTotalValue={total.normalizedThreeMonthsAgo}
                className="border-r border-gray-400 text-[12px]"
                normalized={normalized[tableId]}
              />
              <TableCellComponent
                value={total.sameDayTwoMonthsAgoConsultingFeeNew || 0}
                normalizedValue={
                  (total.sameDayTwoMonthsAgoConsultingFeeNew || 0) /
                  workingDays.sameDayTwoMonthsAgo
                }
                totalValue={total.sameDayTwoMonthsAgo}
                normalizedTotalValue={total.normalizedSameDayTwoMonthsAgo}
                className="border-x border-gray-200 text-[12px]"
                normalized={normalized[tableId]}
              />
              <TableCellComponent
                value={total.twoMonthsAgoConsultingFeeNew || 0}
                normalizedValue={
                  (total.twoMonthsAgoConsultingFeeNew || 0) /
                  workingDays.twoMonthsAgo
                }
                totalValue={total.twoMonthsAgo}
                normalizedTotalValue={total.normalizedTwoMonthsAgo}
                className="border-r border-gray-400 text-[12px]"
                normalized={normalized[tableId]}
              />
              <TableCellComponent
                value={total.sameDayOneMonthAgoConsultingFeeNew || 0}
                normalizedValue={
                  (total.sameDayOneMonthAgoConsultingFeeNew || 0) /
                  workingDays.sameDayOneMonthAgo
                }
                totalValue={total.sameDayOneMonthAgo}
                normalizedTotalValue={total.normalizedSameDayOneMonthAgo}
                className="border-x border-gray-200 text-[12px]"
                normalized={normalized[tableId]}
              />
              <TableCellComponent
                value={total.oneMonthAgoConsultingFeeNew || 0}
                normalizedValue={
                  (total.oneMonthAgoConsultingFeeNew || 0) /
                  workingDays.oneMonthAgo
                }
                totalValue={total.oneMonthAgo}
                normalizedTotalValue={total.normalizedOneMonthAgo}
                className="border-r border-gray-400 text-[12px]"
                normalized={normalized[tableId]}
              />
              <TableCellComponent
                value={total.realizedConsultingFeeNew || 0}
                normalizedValue={
                  (total.realizedConsultingFeeNew || 0) /
                  workingDays.inAnalysisPartial
                }
                totalValue={total.realized}
                normalizedTotalValue={total.normalizedRealized}
                className="border-x border-gray-200"
                normalized={normalized[tableId]}
              />
              <TableCell className="text-right border-x border-gray-200">
                -
              </TableCell>
              <TableCell className="text-right border-r border-gray-400">
                -
              </TableCell>
            </TableRow>
            <TableRow className="text-gray-600 border-t h-[57px]">
              <TableCell className="text-right pr-4"></TableCell>
              <TableCell className="border-r border-gray-400">
                Total Hours
              </TableCell>
              <TableCellComponent
                value={total.sameDayThreeMonthsAgoConsultingHours || 0}
                normalizedValue={
                  total.normalizedSameDayThreeMonthsAgoConsultingHours || 0
                }
                totalValue={total.sameDayThreeMonthsAgoConsultingHours || 0}
                normalizedTotalValue={
                  total.normalizedSameDayThreeMonthsAgoConsultingHours || 0
                }
                className="border-x border-gray-200 text-[12px]"
                normalized={normalized[tableId]}
              />
              <TableCellComponent
                value={total.threeMonthsAgoConsultingHours || 0}
                normalizedValue={
                  total.normalizedThreeMonthsAgoConsultingHours || 0
                }
                totalValue={total.threeMonthsAgoConsultingHours || 0}
                normalizedTotalValue={
                  total.normalizedThreeMonthsAgoConsultingHours || 0
                }
                className="border-r border-gray-400 text-[12px]"
                normalized={normalized[tableId]}
              />
              <TableCellComponent
                value={total.sameDayTwoMonthsAgoConsultingHours || 0}
                normalizedValue={
                  total.normalizedSameDayTwoMonthsAgoConsultingHours || 0
                }
                totalValue={total.sameDayTwoMonthsAgoConsultingHours || 0}
                normalizedTotalValue={
                  total.normalizedSameDayTwoMonthsAgoConsultingHours || 0
                }
                className="border-x border-gray-200 text-[12px]"
                normalized={normalized[tableId]}
                previousValue={total.sameDayThreeMonthsAgoConsultingHours}
                normalizedPreviousValue={
                  total.normalizedSameDayThreeMonthsAgoConsultingHours || 0
                }
              />
              <TableCellComponent
                value={total.twoMonthsAgoConsultingHours || 0}
                normalizedValue={
                  total.normalizedTwoMonthsAgoConsultingHours || 0
                }
                totalValue={total.twoMonthsAgoConsultingHours || 0}
                normalizedTotalValue={
                  total.normalizedTwoMonthsAgoConsultingHours || 0
                }
                className="border-r border-gray-400 text-[12px]"
                normalized={normalized[tableId]}
                previousValue={total.threeMonthsAgoConsultingHours}
                normalizedPreviousValue={
                  total.normalizedThreeMonthsAgoConsultingHours || 0
                }
              />
              <TableCellComponent
                value={total.sameDayOneMonthAgoConsultingHours || 0}
                normalizedValue={
                  total.normalizedSameDayOneMonthAgoConsultingHours || 0
                }
                totalValue={total.sameDayOneMonthAgoConsultingHours || 0}
                normalizedTotalValue={
                  total.normalizedSameDayOneMonthAgoConsultingHours || 0
                }
                className="border-x border-gray-200 text-[12px]"
                normalized={normalized[tableId]}
                previousValue={total.sameDayTwoMonthsAgoConsultingHours}
                normalizedPreviousValue={
                  total.normalizedSameDayTwoMonthsAgoConsultingHours || 0
                }
              />
              <TableCellComponent
                value={total.oneMonthAgoConsultingHours || 0}
                normalizedValue={
                  total.normalizedOneMonthAgoConsultingHours || 0
                }
                totalValue={total.oneMonthAgoConsultingHours || 0}
                normalizedTotalValue={
                  total.normalizedOneMonthAgoConsultingHours || 0
                }
                className="border-r border-gray-400 text-[12px]"
                normalized={normalized[tableId]}
                previousValue={total.twoMonthsAgoConsultingHours}
                normalizedPreviousValue={
                  total.normalizedTwoMonthsAgoConsultingHours || 0
                }
              />
              <TableCellComponent
                value={total.inAnalysisConsultingHours || 0}
                normalizedValue={total.normalizedInAnalysisConsultingHours || 0}
                totalValue={total.inAnalysisConsultingHours || 0}
                normalizedTotalValue={
                  total.normalizedInAnalysisConsultingHours || 0
                }
                className="border-x border-gray-200"
                normalized={normalized[tableId]}
                previousValue={total.sameDayOneMonthAgoConsultingHours}
                normalizedPreviousValue={
                  total.normalizedSameDayOneMonthAgoConsultingHours || 0
                }
              />
              <TableCell className="text-right border-x border-gray-200">
                -
              </TableCell>
              <TableCell className="text-right border-r border-gray-400">
                -
              </TableCell>
            </TableRow>
            <TableRow className="text-gray-600 border-t h-[57px]">
              <TableCell className="text-right pr-4"></TableCell>
              <TableCell className="border-r border-gray-400">Average Rate</TableCell>
              <TableCellComponent
                value={
                  total.sameDayThreeMonthsAgo /
                    total.sameDayThreeMonthsAgoConsultingHours || 0
                }
                normalizedValue={
                  total.sameDayThreeMonthsAgo /
                    total.sameDayThreeMonthsAgoConsultingHours || 0
                }
                totalValue={
                  total.sameDayThreeMonthsAgo /
                    total.sameDayThreeMonthsAgoConsultingHours || 0
                }
                normalizedTotalValue={
                  total.sameDayThreeMonthsAgo /
                    total.sameDayThreeMonthsAgoConsultingHours || 0
                }
                className="border-x border-gray-200 text-[12px]"
                normalized={false}
              />
              <TableCellComponent
                value={
                  total.threeMonthsAgo /
                    total.threeMonthsAgoConsultingHours || 0
                }
                normalizedValue={
                  total.threeMonthsAgo /
                    total.threeMonthsAgoConsultingHours || 0
                }
                totalValue={
                  total.threeMonthsAgo /
                    total.threeMonthsAgoConsultingHours || 0
                }
                normalizedTotalValue={
                  total.threeMonthsAgo /
                    total.threeMonthsAgoConsultingHours || 0
                }
                className="border-r border-gray-400 text-[12px]"
                normalized={false}
              />
              <TableCellComponent
                value={
                  total.sameDayTwoMonthsAgo /
                    total.sameDayTwoMonthsAgoConsultingHours || 0
                }
                normalizedValue={
                  total.sameDayTwoMonthsAgo /
                    total.sameDayTwoMonthsAgoConsultingHours || 0
                }
                totalValue={
                  total.sameDayTwoMonthsAgo /
                    total.sameDayTwoMonthsAgoConsultingHours || 0
                }
                normalizedTotalValue={
                  total.sameDayTwoMonthsAgo /
                    total.sameDayTwoMonthsAgoConsultingHours || 0
                }
                className="border-x border-gray-200 text-[12px]"
                normalized={false}
              />
              <TableCellComponent
                value={
                  total.twoMonthsAgo /
                    total.twoMonthsAgoConsultingHours || 0
                }
                normalizedValue={
                  total.twoMonthsAgo /
                    total.twoMonthsAgoConsultingHours || 0
                }
                totalValue={
                  total.twoMonthsAgo /
                    total.twoMonthsAgoConsultingHours || 0
                }
                normalizedTotalValue={
                  total.twoMonthsAgo /
                    total.twoMonthsAgoConsultingHours || 0
                }
                className="border-r border-gray-400 text-[12px]"
                normalized={false}
              />
              <TableCellComponent
                value={
                  total.sameDayOneMonthAgo /
                    total.sameDayOneMonthAgoConsultingHours || 0
                }
                normalizedValue={
                  total.sameDayOneMonthAgo /
                    total.sameDayOneMonthAgoConsultingHours || 0
                }
                totalValue={
                  total.sameDayOneMonthAgo /
                    total.sameDayOneMonthAgoConsultingHours || 0
                }
                normalizedTotalValue={
                  total.sameDayOneMonthAgoConsultingFee /
                    total.sameDayOneMonthAgoConsultingHours || 0
                }
                className="border-x border-gray-200 text-[12px]"
                normalized={false}
              />
              <TableCellComponent
                value={
                  total.oneMonthAgo /
                    total.oneMonthAgoConsultingHours || 0
                }
                normalizedValue={
                  total.oneMonthAgo /
                    total.oneMonthAgoConsultingHours || 0
                }
                totalValue={
                  total.oneMonthAgo /
                    total.oneMonthAgoConsultingHours || 0
                }
                normalizedTotalValue={
                  total.oneMonthAgo /
                    total.oneMonthAgoConsultingHours || 0
                }
                className="border-r border-gray-400 text-[12px]"
                normalized={false}
              />
              <TableCellComponent
                value={
                  total.realized /
                    total.inAnalysisConsultingHours || 0
                }
                normalizedValue={
                  total.realized /
                    total.inAnalysisConsultingHours || 0
                }
                totalValue={
                  total.realized /
                    total.inAnalysisConsultingHours || 0
                }
                normalizedTotalValue={
                  total.realized /
                    total.inAnalysisConsultingHours || 0
                }
                className="border-x border-gray-200"
                normalized={false}
              />
              <TableCell className="text-right border-x border-gray-200">
                -
              </TableCell>
              <TableCell className="text-right border-r border-gray-400">
                -
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
