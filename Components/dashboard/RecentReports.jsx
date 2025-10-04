import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function RecentReports({ reports, isLoading }) {
  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="text-xl font-bold text-slate-900">
          Recent Reports
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">No reports generated yet</p>
            <Link to={createPageUrl("GenerateReport")}>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Generate First Report
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.slice(0, 3).map((report) => (
              <div key={report.id} className="p-4 border border-slate-200 rounded-xl hover:shadow-md transition-all duration-200 bg-white">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 mb-1">Weekly Report</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {format(new Date(report.created_date), "MMM d, yyyy")}
                      </span>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="bg-slate-100 px-2 py-1 rounded">
                        {report.total_feedback_count || 0} items
                      </span>
                      {report.high_urgency_count > 0 && (
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded">
                          {report.high_urgency_count} urgent
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <Link to={createPageUrl("ReportsHistory")}>
              <Button variant="outline" className="w-full gap-2 mt-2">
                View All Reports
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}