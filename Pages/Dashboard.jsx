import React, { useState, useEffect } from "react";
import { Feedback, Report } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  TrendingUp, 
  AlertCircle, 
  MessageSquare, 
  FileText,
  Sparkles,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  Minus
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

import StatsCard from "../components/dashboard/StatsCard";
import FeedbackList from "../components/dashboard/FeedbackList";
import RecentReports from "../components/dashboard/RecentReports";

export default function Dashboard() {
  const [feedback, setFeedback] = useState([]);
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [feedbackData, reportsData] = await Promise.all([
      Feedback.list("-created_date", 50),
      Report.list("-created_date", 5)
    ]);
    setFeedback(feedbackData);
    setReports(reportsData);
    setIsLoading(false);
  };

  const getSentimentCounts = () => {
    const counts = { positive: 0, neutral: 0, negative: 0 };
    feedback.forEach(f => {
      if (f.sentiment) counts[f.sentiment]++;
    });
    return counts;
  };

  const getUrgencyCount = () => {
    return feedback.filter(f => f.urgency === "high").length;
  };

  const sentimentCounts = getSentimentCounts();

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Product Intelligence Dashboard
            </h1>
            <p className="text-slate-600">
              Transform customer feedback into actionable insights
            </p>
          </div>
          <div className="flex gap-3">
            <Link to={createPageUrl("SubmitFeedback")}>
              <Button variant="outline" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                Add Feedback
              </Button>
            </Link>
            <Link to={createPageUrl("GenerateReport")}>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 gap-2 shadow-lg">
                <Sparkles className="w-4 h-4" />
                Generate Report
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Feedback"
            value={feedback.length}
            icon={MessageSquare}
            color="blue"
            isLoading={isLoading}
          />
          <StatsCard
            title="High Urgency"
            value={getUrgencyCount()}
            icon={AlertCircle}
            color="red"
            isLoading={isLoading}
          />
          <StatsCard
            title="Positive Sentiment"
            value={sentimentCounts.positive}
            icon={ThumbsUp}
            color="green"
            isLoading={isLoading}
          />
          <StatsCard
            title="Reports Generated"
            value={reports.length}
            icon={FileText}
            color="purple"
            isLoading={isLoading}
          />
        </div>

        {/* Sentiment Overview */}
        <Card className="mb-8 border-0 shadow-xl bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Sentiment Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 w-32">
                    <ThumbsUp className="w-5 h-5 text-emerald-500" />
                    <span className="font-medium text-slate-700">Positive</span>
                  </div>
                  <div className="flex-1 bg-slate-100 rounded-full h-8 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full flex items-center justify-end pr-3 transition-all duration-500"
                      style={{ width: `${feedback.length ? (sentimentCounts.positive / feedback.length * 100) : 0}%` }}
                    >
                      <span className="text-white font-semibold text-sm">{sentimentCounts.positive}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 w-32">
                    <Minus className="w-5 h-5 text-amber-500" />
                    <span className="font-medium text-slate-700">Neutral</span>
                  </div>
                  <div className="flex-1 bg-slate-100 rounded-full h-8 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-amber-600 h-full flex items-center justify-end pr-3 transition-all duration-500"
                      style={{ width: `${feedback.length ? (sentimentCounts.neutral / feedback.length * 100) : 0}%` }}
                    >
                      <span className="text-white font-semibold text-sm">{sentimentCounts.neutral}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 w-32">
                    <ThumbsDown className="w-5 h-5 text-red-500" />
                    <span className="font-medium text-slate-700">Negative</span>
                  </div>
                  <div className="flex-1 bg-slate-100 rounded-full h-8 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-red-500 to-red-600 h-full flex items-center justify-end pr-3 transition-all duration-500"
                      style={{ width: `${feedback.length ? (sentimentCounts.negative / feedback.length * 100) : 0}%` }}
                    >
                      <span className="text-white font-semibold text-sm">{sentimentCounts.negative}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <FeedbackList 
              feedback={feedback}
              isLoading={isLoading}
              onRefresh={loadData}
            />
          </div>
          <div>
            <RecentReports 
              reports={reports}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}