import React from "react";
import { Heading } from "@/components/catalyst/heading";

interface CaseHeaderProps {
  caseItem: {
    client?: {
      logoUrl?: string;
      name?: string;
    };
    title: string;
    sponsor: string;
    startOfContract?: string;
    endOfContract?: string;
    weeklyApprovedHours?: number;
    preContractedValue?: boolean;
    isActive: boolean;
  };
}

export function CaseHeader({ caseItem }: CaseHeaderProps) {
  return (
    <div className="flex items-center border-b border-zinc-950/10 pb-4 mb-4 dark:border-white/10">
      {caseItem.client?.logoUrl && (
        <div className="flex items-center h-full mr-6">
          <img
            src={caseItem.client.logoUrl}
            alt={`${caseItem.client.name} logo`}
            className="w-32 h-16 object-contain flex-shrink-0"
          />
        </div>
      )}
      <div className="flex flex-col flex-grow space-y-2">
        <div>
          <h3 className="text-sm font-bold uppercase text-gray-600">{caseItem.client?.name || 'Unknown Client'}</h3>
          <Heading className="mt-1">{caseItem.title}</Heading>
        </div>
        <p className="text-sm font-medium text-gray-700">{caseItem.sponsor}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-gray-600">
          <div className="flex items-center space-x-1">
            {caseItem.startOfContract && (
              <span className="text-green-600">
                {new Date(caseItem.startOfContract).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            )}
            {caseItem.startOfContract && caseItem.endOfContract && <span>-</span>}
            {caseItem.endOfContract && (
              <span className="text-red-600">
                {new Date(caseItem.endOfContract).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
          {caseItem.weeklyApprovedHours && (
            <span className="border-l pl-3 border-gray-300">
              Hours per week: {caseItem.weeklyApprovedHours}{caseItem.preContractedValue ? ' (pre)' : ''}
            </span>
          )}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${caseItem.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {caseItem.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>
    </div>
  );
}