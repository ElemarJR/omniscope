import { format } from "date-fns";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import { Divider } from "@/components/catalyst/divider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { STAT_COLORS } from "@/app/constants/colors";
import Link from "next/link";

interface RegularRevenueProps {
  data: any;
  date: Date;
}

export function RegularRevenue({ data, date }: RegularRevenueProps) {
  const [expandedClients, setExpandedClients] = useState<Set<string>>(
    new Set()
  );
  const [expandedSponsors, setExpandedSponsors] = useState<Set<string>>(
    new Set()
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const toggleClient = (clientName: string) => {
    const newExpanded = new Set(expandedClients);
    if (newExpanded.has(clientName)) {
      newExpanded.delete(clientName);
    } else {
      newExpanded.add(clientName);
    }
    setExpandedClients(newExpanded);
  };

  const toggleSponsor = (sponsorName: string) => {
    const newExpanded = new Set(expandedSponsors);
    if (newExpanded.has(sponsorName)) {
      newExpanded.delete(sponsorName);
    } else {
      newExpanded.add(sponsorName);
    }
    setExpandedSponsors(newExpanded);
  };

  const calculateProjectTotal = (projects: any[]) => {
    return projects.reduce((sum, project) => {
      return sum + project.fee;
    }, 0);
  };

  const calculateCaseTotal = (cases: any[]) => {
    return cases.reduce((sum, caseItem) => {
      return sum + calculateProjectTotal(caseItem.byProject.data);
    }, 0);
  };

  const calculateSponsorTotal = (sponsors: any[]) => {
    return sponsors.reduce((sum, sponsor) => {
      return sum + calculateCaseTotal(sponsor.byCase.data);
    }, 0);
  };

  const calculateClientTotal = (clients: any[]) => {
    return clients.reduce((sum, client) => {
      return sum + calculateSponsorTotal(client.bySponsor.data);
    }, 0);
  };

  const calculateManagerTotal = (managers: any[]) => {
    return managers.reduce((sum, manager) => {
      return sum + calculateClientTotal(manager.byClient.data);
    }, 0);
  };

  const managers = data?.financial?.revenueTracking?.regular?.monthly?.byAccountManager?.data || [];

  return (
    <>
      <SectionHeader
        title="Regular Consulting Revenue"
        subtitle={format(date, "'until' MMM dd, yyyy")}
      />
      <div className="px-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account Manager / Client / Sponsor / Case</TableHead>
              <TableHead>Projects</TableHead>
              <TableHead className="text-right">Fee</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {managers.map((manager: any) => (
              <>
                <TableRow key={manager.name} className="bg-gray-100">
                  <TableCell className="text-sm font-semibold">
                    {manager.slug ? (
                      <Link href={`/team/account-managers/${manager.slug}`} className="text-blue-600 hover:underline">
                        {manager.name}
                      </Link>
                    ) : (
                      manager.name
                    )}
                  </TableCell>
                  <TableCell></TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(calculateClientTotal(manager.byClient.data))}
                  </TableCell>
                </TableRow>

                {manager.byClient.data.map((client: any) => (
                  <>
                    <TableRow
                      key={`${manager.name}-${client.name}`}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleClient(client.name)}
                    >
                      <TableCell className="text-sm text-gray-600 flex items-center gap-2 pl-8">
                        {expandedClients.has(client.name) ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                        {client.slug ? (
                          <Link href={`/engagements/clients/${client.slug}`} className="text-blue-600 hover:underline">
                            {client.name}
                          </Link>
                        ) : (
                          client.name
                        )}
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(
                          calculateSponsorTotal(client.bySponsor.data)
                        )}
                      </TableCell>
                    </TableRow>

                    {expandedClients.has(client.name) &&
                      client.bySponsor.data.map((sponsor: any) => (
                        <>
                          <TableRow
                            key={`${client.name}-${sponsor.name}`}
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() => toggleSponsor(sponsor.name)}
                          >
                            <TableCell className="text-sm text-gray-600 flex items-center gap-2 pl-12">
                              {expandedSponsors.has(sponsor.name) ? (
                                <ChevronDown size={16} />
                              ) : (
                                <ChevronRight size={16} />
                              )}
                              {sponsor.slug ? (
                                <Link href={`/engagements/sponsors/${sponsor.slug}`} className="text-blue-600 hover:underline">
                                  {sponsor.name}
                                </Link>
                              ) : (
                                sponsor.name
                              )}
                            </TableCell>
                            <TableCell></TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(
                                calculateCaseTotal(sponsor.byCase.data)
                              )}
                            </TableCell>
                          </TableRow>

                          {expandedSponsors.has(sponsor.name) &&
                            sponsor.byCase.data.map((caseItem: any) => (
                              <TableRow
                                key={`${sponsor.name}-${caseItem.title}`}
                                className="bg-gray-50"
                              >
                                <TableCell className="pl-16 text-sm text-gray-600">
                                  {caseItem.slug ? (
                                    <Link href={`/engagements/cases/${caseItem.slug}`} className="text-blue-600 hover:underline">
                                      {caseItem.title}
                                    </Link>
                                  ) : (
                                    caseItem.title
                                  )}
                                </TableCell>
                                <TableCell>
                                  <table className="w-full text-xs border-collapse">
                                    <tbody>
                                      {caseItem.byProject.data.map(
                                        (project: any) => {
                                          const textColor =
                                            STAT_COLORS[
                                              project.kind as keyof typeof STAT_COLORS
                                            ];

                                          return (
                                            <tr
                                              key={project.name}
                                              className="border-b border-gray-200"
                                            >
                                              <td className="pr-2 w-[250px] break-words border-r border-gray-200">
                                                <div
                                                  style={{ color: textColor }}
                                                >
                                                  {project.name}
                                                </div>
                                              </td>
                                              <td className="text-gray-600 pl-2 w-[100px]">
                                                {project.rate}/h
                                              </td>
                                              <td className="text-gray-600 pl-2 w-[100px]">
                                                {project.hours}h
                                              </td>
                                            </tr>
                                          );
                                        }
                                      )}
                                    </tbody>
                                  </table>
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatCurrency(
                                    calculateProjectTotal(caseItem.byProject.data)
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                        </>
                      ))}
                  </>
                ))}
              </>
            ))}
            <TableRow className="font-bold">
              <TableCell colSpan={2}>Total</TableCell>
              <TableCell className="text-right">
                {formatCurrency(calculateManagerTotal(managers))}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </>
  );
}
