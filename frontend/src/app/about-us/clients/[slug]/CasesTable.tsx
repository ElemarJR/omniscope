import React from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/catalyst/badge";
import { STAT_COLORS } from "@/app/constants/colors";

interface CasesTableProps {
  filteredCases: any[];
  showSponsorColumn?: boolean;
}

interface TrackingProject {
  id: string;
  name: string;
  kind: string;
  dueOn?: string;
  budget?: {
    hours: number;
    period: string;
  };
}

export function CasesTable({
  filteredCases,
  showSponsorColumn = true,
}: CasesTableProps) {
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "Critical":
        return "bg-rose-500";
      case "Requires attention":
        return "bg-amber-500";
      case "All right":
        return "bg-lime-500";
      default:
        return "bg-zinc-500";
    }
  };

  const getDaysSinceUpdate = (updateDate: string | null) => {
    if (!updateDate) return null;
    const update = new Date(updateDate);
    const today = new Date();
    const diffTime = today.getTime() - update.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDaysUntilEnd = (endDate: string | null) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not defined";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  // Sort cases alphabetically by title
  const sortedCases = [...filteredCases].sort((a, b) =>
    a.caseDetails.title.localeCompare(b.caseDetails.title)
  );

  return (
    <Table className="border-collapse">
      <TableHeader>
        <TableRow className="border-b border-gray-200">
          <TableHead className="w-[360px] border-r border-gray-200">
            Case
          </TableHead>
          {showSponsorColumn && (
            <TableHead className="border-r border-gray-200">Sponsor</TableHead>
          )}
          <TableHead className="border-r border-gray-200">
            Contract Period
          </TableHead>
          <TableHead className="border-r border-gray-200">
            Projects & Team Members
          </TableHead>
          <TableHead>CWH</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedCases.map((caseData: any, index: number) => {
          const daysSinceUpdate = getDaysSinceUpdate(
            caseData.caseDetails.lastUpdate?.date
          );
          const daysUntilEnd = getDaysUntilEnd(
            caseData.caseDetails.endOfContract
          );
          return (
            <TableRow
              key={caseData.caseDetails.id}
              className={`hover:bg-gray-50 transition-all duration-300 ease-in-out border-b border-gray-200 ${
                index % 2 === 0 ? "bg-white" : "bg-gray-50"
              }`}
            >
              <TableCell className="w-[330px] border-r border-gray-200">
                <Link
                  href={`/about-us/cases/${caseData.caseDetails.slug}`}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          caseData.caseDetails.lastUpdate
                            ? getStatusColor(
                                caseData.caseDetails.lastUpdate.status
                              )
                            : "bg-zinc-500"
                        }`}
                        title={
                          caseData.caseDetails.lastUpdate?.status || "No status"
                        }
                      />
                      <div className="flex items-center gap-2">
                        {caseData.caseDetails.preContractedValue === "PRE" && (
                          <Badge color="blue">PRE</Badge>
                        )}
                        <p className="w-[325px] text-xs whitespace-normal break-words leading-tight">
                          {caseData.caseDetails.title}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs pl-4">
                      {caseData.caseDetails.lastUpdate ? (
                        <>
                          {daysSinceUpdate !== null && (
                            <span
                              className={
                                daysSinceUpdate > 30
                                  ? "text-red-500"
                                  : "text-gray-500"
                              }
                            >
                              {daysSinceUpdate} days since last update
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-red-500">
                          No update information
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </TableCell>
              {showSponsorColumn && (
                <TableCell className="border-r border-gray-200">
                  <span className="text-xs text-gray-600">
                    {caseData.caseDetails.sponsor || "No sponsor"}
                  </span>
                </TableCell>
              )}
              <TableCell className="border-r border-gray-200">
                <div className="flex flex-col">
                  <span className="text-xs text-green-600">
                    {formatDate(caseData.caseDetails.startOfContract)}
                  </span>
                  <span className="text-xs text-red-600">
                    {formatDate(caseData.caseDetails.endOfContract)}
                  </span>
                  {daysUntilEnd !== null && daysUntilEnd > 0 && (
                    <span
                      className={`text-xs ${
                        daysUntilEnd <= 30 ? "text-red-500" : "text-gray-500"
                      }`}
                    >
                      {daysUntilEnd} days remaining
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="border-r border-gray-200">
                {caseData.caseDetails.tracker &&
                caseData.caseDetails.tracker.length > 0 ? (
                  <Table className="w-full text-xs">
                    <TableBody>
                      {caseData.caseDetails.tracker.map(
                        (track: TrackingProject) => {
                          const projectWorkers =
                            caseData.workersByTrackingProject?.find(
                              (project: { projectId: string }) =>
                                project.projectId === track.id
                            )?.workers || [];

                          const textColor =
                            STAT_COLORS[track.kind as keyof typeof STAT_COLORS];
                          const rowSpan = Math.max(1, projectWorkers.length);

                          console.log('Track data:', {
                            id: track.id,
                            name: track.name,
                            dueOn: track.dueOn,
                            raw: track
                          });

                          return (
                            <React.Fragment key={track.id}>
                              <TableRow>
                                <TableCell
                                  rowSpan={rowSpan}
                                  className="pr-2 w-[210px] break-words border-r border-gray-200 align-top"
                                >
                                  <div style={{ color: textColor }}>
                                    {track.name}
                                    {track.budget && (
                                      <div className="text-gray-500 mt-1">
                                        <span className="inline-block bg-gray-100 px-1 rounded">
                                          {track.budget.hours}h/
                                          {track.budget.period}
                                        </span>
                                      </div>
                                    )}
                                    {track.dueOn && (
                                      <div
                                        className={`mt-1 text-xs ${
                                          new Date(track.dueOn) < new Date()
                                            ? "text-red-500"
                                            : "text-muted-foreground"
                                        }`}
                                      >
                                        Due on:{" "}
                                        {new Date(track.dueOn).toDateString()}
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-gray-600 pl-2">
                                  {projectWorkers.length > 0 ? (
                                    projectWorkers[0]
                                  ) : (
                                    <span className="text-gray-400">
                                      No team members
                                    </span>
                                  )}
                                </TableCell>
                              </TableRow>
                              {projectWorkers
                                .slice(1)
                                .map((worker: string, index: number) => (
                                  <TableRow
                                    key={`${track.id}-worker-${index + 1}`}
                                  >
                                    <TableCell className="text-gray-600 pl-2">
                                      {worker}
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </React.Fragment>
                          );
                        }
                      )}
                    </TableBody>
                  </Table>
                ) : (
                  <span className="text-xs text-gray-400">
                    No tracking projects
                  </span>
                )}
              </TableCell>
              <TableCell>
                <span className="text-xs text-gray-600">
                  {(caseData.totalHours || 0).toFixed(1)}
                </span>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
