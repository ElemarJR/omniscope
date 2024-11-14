import React from "react";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import SectionHeader from "@/components/SectionHeader";

interface TrackingProjectsProps {
  tracker: Array<{
    id: string;
    name: string;
    everhourProjectsIds?: string[];
    weeklyApprovedHours?: number;
    startOfContract?: string;
    endOfContract?: string;
    budget?: {
      hours: number;
      period: string;
    };
  }>;
  workersByTrackingProject: Array<{
    projectId: string;
    workers: string[];
  }>;
}

export function TrackingProjects({
  tracker,
  workersByTrackingProject,
}: TrackingProjectsProps) {
  if (!tracker || tracker.length === 0) return null;

  return (
    <div className="mt-8">
      <SectionHeader title="Tracking Projects" subtitle="" />
      <div className="ml-4 mr-4">
        <Table>
          <TableBody>
            {tracker.map((track) => {
              const projectWorkers =
                workersByTrackingProject?.find(
                  (project) => project.projectId === track.id
                )?.workers || [];

              return (
                <React.Fragment key={track.id}>
                  {projectWorkers.length > 0 ? (
                    <>
                      <TableRow>
                        <TableCell
                          rowSpan={projectWorkers.length}
                          className="w-1/3 break-words border-r"
                        >
                          {track.name}
                          <div className="text-xs text-muted-foreground">
                            {track.everhourProjectsIds?.join(", ")}
                          </div>
                          {track.budget && (
                            <div className="mt-1 text-xs text-muted-foreground">
                              Budget: {track.budget.hours}h / {track.budget.period}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="w-1/3">{projectWorkers[0]}</TableCell>
                      </TableRow>
                      {projectWorkers.slice(1).map((worker: string) => (
                        <TableRow key={`${track.id}-${worker}`}>
                          <TableCell className="w-1/3">{worker}</TableCell>
                        </TableRow>
                      ))}
                    </>
                  ) : (
                    <TableRow>
                      <TableCell className="w-1/3 break-words border-r">
                        {track.name}
                        <div className="text-xs text-muted-foreground">
                          {track.everhourProjectsIds?.join(", ")}
                        </div>
                        {track.budget && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            Budget: {track.budget.hours}h / {track.budget.period}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="w-1/3 text-muted-foreground">
                        No team members
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 