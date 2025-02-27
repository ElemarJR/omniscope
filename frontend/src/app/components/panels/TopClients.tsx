import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/catalyst/table";
import RankingIndicator from "@/components/RankingIndicator";
import { ChevronDown, ChevronUp } from "lucide-react";

interface TopClientsProps {
  clientData: any[];
  selectedStat: string;
  totalHours: number;
}

const fadeInAnimation = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const TopClients: React.FC<TopClientsProps> = ({ clientData, selectedStat, totalHours }) => {
  const [animationTrigger, setAnimationTrigger] = useState(0);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setAnimationTrigger(prev => prev + 1);
  }, [clientData, selectedStat]);

  const filterItems = (item: any) => {
    if (selectedStat === "allClients" || selectedStat === "total") return true;
    return item.byKind[selectedStat].totalHours > 0;
  };

  const sortItems = (a: any, b: any) => {
    const getRelevantHours = (item: any) => {
      if (selectedStat === "allClients" || selectedStat === "total") {
        return item.totalHours;
      }
      return item.byKind[selectedStat].totalHours;
    };
    return getRelevantHours(b) - getRelevantHours(a);
  };

  const getItemValue = (item: any, field: string) => {
    if (selectedStat === "allClients" || selectedStat === "total") {
      return item[field];
    }
    return item.byKind[selectedStat][field];
  };

  const formatHours = (hours: number) => {
    return hours % 1 === 0 ? Math.floor(hours) : hours.toFixed(1);
  };

  const calculatePercentage = (itemHours: number) => {
    return totalHours > 0 ? ((itemHours / totalHours) * 100).toFixed(1) : "0.0";
  };

  const filteredClients = clientData?.filter(filterItems).sort(sortItems).slice(0, 10);
  const displayedClients = expanded ? filteredClients : filteredClients?.slice(0, 3);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const getTitle = () => {
    if (!expanded) {
      return filteredClients?.length > 3 ? "Top 3 Clients" : "Clients";
    } else {
      return filteredClients?.length < 10 ? "Clients" : "Top 10 Clients";
    }
  };

  return (
    <div>
      <style>{fadeInAnimation}</style>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">
            {getTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table className="w-full table-fixed">
            <TableHead>
              <TableRow className="bg-gray-100">
                <TableHeader className="font-semibold text-left w-8/12">Client</TableHeader>
                <TableHeader className="font-semibold text-center w-4/12">Hours</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedClients?.map((client: any, index: number) => (
                <TableRow 
                  key={`${client.name}-${animationTrigger}`}
                  className={`hover:bg-gray-50 transition-all duration-300 ease-in-out ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  style={{ 
                    animation: `fadeIn 0.5s ease-out ${index * 50}ms forwards`,
                    opacity: 0,
                  }}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      <RankingIndicator
                        index={index + 1}
                        percentage={calculatePercentage(getItemValue(client, 'totalHours'))}
                      />
                      <div className="flex flex-col">
                        <span style={{ transition: 'all 0.3s ease-in-out' }}>{client.name}</span>
                        <span className="text-xs text-gray-500" style={{ transition: 'all 0.3s ease-in-out' }}>
                          {getItemValue(client, 'uniqueCases')} case(s)
                          {getItemValue(client, 'uniqueWorkers') > 1 && ` • ${getItemValue(client, 'uniqueWorkers')} workers`}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-medium" style={{ transition: 'all 0.3s ease-in-out' }}>
                      {formatHours(getItemValue(client, 'totalHours'))}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredClients?.length > 3 && (
            <div className="mt-4 text-center">
              <button
                onClick={toggleExpand}
                className="flex items-center justify-center w-full py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-2" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-2" />
                    Show More
                  </>
                )}
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TopClients;
