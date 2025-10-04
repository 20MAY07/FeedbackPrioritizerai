import React, { useState, useEffect } from "react";
import { Feedback } from "@/entities/Feedback";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, subDays, startOfDay } from "date-fns";

const COLORS = {
  high: "#dc2626",
  medium: "#f59e0b",
  low: "#3b82f6",
  bug: "#ef4444",
  feature_request: "#a855f7",
  ux_issue: "#3b82f6",
  pricing: "#10b981",
  other: "#6b7280",
  positive: "#10b981",
  neutral: "#f59e0b",
  negative: "#ef4444"
};

export default function Statistics() {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await Feedback.list("-created_date");
    setFeedback(data);
    setIsLoading(false);
  };

  const getUrgencyData = () => {
    const counts = { high: 0, medium: 0, low: 0 };
    feedback.forEach(f => {
      if (f.urgency) counts[f.urgency]++;
    });
    return [
      { name: "High", value: counts.high, color: COLORS.high },
      { name: "Medium", value: counts.medium, color: COLORS.medium },
      { name: "Low", value: counts.low, color: COLORS.low }
    ];
  };

  const getCategoryData = () => {
    const counts = { bug: 0, feature_request: 0, ux_issue: 0, pricing: 0, other: 0 };
    feedback.forEach(f => {
      if (f.category) counts[f.category]++;
    });
    return [
      { name: "Bug", value: counts.bug, color: COLORS.bug },
      { name: "Feature Request", value: counts.feature_request, color: COLORS.feature_request },
      { name: "UX Issue", value: counts.ux_issue, color: COLORS.ux_issue },
      { name: "Pricing", value: counts.pricing, color: COLORS.pricing },
      { name: "Other", value: counts.other, color: COLORS.other }
    ].filter(item => item.value > 0);
  };

  const getSentimentData = () => {
    const counts = { positive: 0, neutral: 0, negative: 0 };
    feedback.forEach(f => {
      if (f.sentiment) counts[f.sentiment]++;
    });
    return [
      { name: "Positive", value: counts.positive, color: COLORS.positive },
      { name: "Neutral", value: counts.neutral, color: COLORS.neutral },
      { name: "Negative", value: counts.negative, color: COLORS.negative }
    ];
  };

  const getSourceData = () => {
    const counts = {};
    feedback.forEach(f => {
      if (f.source) {
        counts[f.source] = (counts[f.source] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: name.replace(/_/g, " "),
      value
    }));
  };

  const getTrendData = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i));
      const dateStr = format(date, "yyyy-MM-dd");
      const dayFeedback = feedback.filter(f => 
        format(startOfDay(new Date(f.created_date)), "yyyy-MM-dd") === dateStr
      );
      
      last7Days.push({
        date: format(date, "MMM d"),
        positive: dayFeedback.filter(f => f.sentiment === "positive").length,
        neutral: dayFeedback.filter(f => f.sentiment === "neutral").length,
        negative: dayFeedback.filter(f => f.sentiment === "negative").length
      });
    }
    return last7Days;
  };

  const urgencyData = getUrgencyData();
  const categoryData = getCategoryData();
  const sentimentData = getSentimentData();
  const sourceData = getSourceData();
  const trendData = getTrendData();

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Dashboard"))}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <TrendingUp className="w-10 h-10 text-blue-600" />
            Feedback Analytics
          </h1>
          <p className="text-slate-600">
            Visual insights from your customer feedback data
          </p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="border-0 shadow-xl">
                <CardContent className="p-6">
                  <Skeleton className="h-80 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : feedback.length === 0 ? (
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur">
            <CardContent className="p-12 text-center">
              <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No Data Available
              </h3>
              <p className="text-slate-600 mb-6">
                Add feedback entries to see analytics
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Urgency Distribution - Bar Chart */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Urgency Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={urgencyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "white", 
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                      }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {urgencyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Category Breakdown - Pie Chart */}
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-purple-600" />
                    Category Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "white", 
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Sentiment Distribution - Pie Chart */}
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-emerald-600" />
                    Sentiment Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={sentimentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {sentimentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "white", 
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Sentiment Trend - Line Chart */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  7-Day Sentiment Trend
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "white", 
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="positive" stroke={COLORS.positive} strokeWidth={2} />
                    <Line type="monotone" dataKey="neutral" stroke={COLORS.neutral} strokeWidth={2} />
                    <Line type="monotone" dataKey="negative" stroke={COLORS.negative} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Feedback Source - Bar Chart */}
            {sourceData.length > 0 && (
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    Feedback by Source
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={sourceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "white", 
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                        }}
                      />
                      <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}