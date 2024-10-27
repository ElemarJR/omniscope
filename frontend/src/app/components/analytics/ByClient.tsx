import { By } from "@/app/components/analytics/By";

interface ByClientProps {
  timesheet: {
    uniqueClients: number;
    averageHoursPerClient: number;
    stdDevHoursPerClient: number;
    byKind: {
      consulting: {
        uniqueClients: number;
      };
      squad: {
        uniqueClients: number;
      };
      internal: {
        uniqueClients: number;
      };
      handsOn: {
        uniqueClients: number;
      };
    };
    byClient: Array<{
      name: string;
      totalConsultingHours: number;
      totalSquadHours: number;
      totalInternalHours: number;
      totalHandsOnHours: number;
    }>;
  };
}

export function ByClient({ timesheet, className }: ByClientProps & { className?: string }) {
  const data = {
    uniqueItems: timesheet.uniqueClients,
    byKind: {
      consulting: { uniqueItems: timesheet.byKind.consulting.uniqueClients },
      squad: { uniqueItems: timesheet.byKind.squad.uniqueClients },
      internal: { uniqueItems: timesheet.byKind.internal.uniqueClients },
      handsOn: { uniqueItems: timesheet.byKind.handsOn.uniqueClients },
    },
    byItem: timesheet.byClient,
  };

  const labels = {
    total: "Clients",
    consulting: "Consulting Clients",
    squad: "Squad Clients",
    internal: "Internal Clients",
    handsOn: "Hands-On Clients",
  };

  return <By title="By Client" data={data} labels={labels} className={className} />;
}