import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, User, Mail, Tag, AlertCircle, TrendingUp, ThumbsUp, ThumbsDown, Minus } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const urgencyColors = {
  high: "bg-red-100 text-red-800 border-red-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  low: "bg-blue-100 text-blue-800 border-blue-200"
};

const categoryColors = {
  bug: "bg-red-100 text-red-800 border-red-200",
  feature_request: "bg-purple-100 text-purple-800 border-purple-200",
  ux_issue: "bg-blue-100 text-blue-800 border-blue-200",
  pricing: "bg-emerald-100 text-emerald-800 border-emerald-200",
  other: "bg-slate-100 text-slate-800 border-slate-200"
};

export default function FeedbackList({ feedback, isLoading, onRefresh }) {
  const [filter, setFilter] = useState("all");

  const filteredFeedback = filter === "all" 
    ? feedback 
    : feedback.filter(f => f.urgency === filter);

  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur">
      <CardHeader className="border-b border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle className="text-xl font-bold text-slate-900">
            Recent Feedback
          </CardTitle>
          <Tabs defaultValue="all" onValueChange={setFilter}>
            <TabsList className="bg-slate-100">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="high">High Urgency</TabsTrigger>
              <TabsTrigger value="medium">Medium</TabsTrigger>
              <TabsTrigger value="low">Low</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="p-4 border border-slate-200 rounded-xl">
                <Skeleton className="h-24 w-full" />
              </div>
            ))
          ) : filteredFeedback.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No feedback entries yet</p>
            </div>
          ) : (
            filteredFeedback.slice(0, 10).map((item) => (
              <div key={item.id} className="p-5 border border-slate-200 rounded-xl hover:shadow-lg transition-all duration-200 bg-white">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.urgency && (
                      <Badge className={`${urgencyColors[item.urgency]} border font-medium`}>
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {item.urgency.toUpperCase()}
                      </Badge>
                    )}
                    {item.impact && (
                      <Badge className={`${urgencyColors[item.impact]} border font-medium`}>
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Impact: {item.impact}
                      </Badge>
                    )}
                    {item.category && (
                      <Badge className={`${categoryColors[item.category]} border font-medium`}>
                        <Tag className="w-3 h-3 mr-1" />
                        {item.category.replace(/_/g, " ")}
                      </Badge>
                    )}
                    {item.sentiment && (
                      <Badge variant="outline" className="border font-medium">
                        {item.sentiment === "positive" && <ThumbsUp className="w-3 h-3 mr-1 text-emerald-600" />}
                        {item.sentiment === "negative" && <ThumbsDown className="w-3 h-3 mr-1 text-red-600" />}
                        {item.sentiment === "neutral" && <Minus className="w-3 h-3 mr-1 text-amber-600" />}
                        {item.sentiment}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-slate-500">
                    {format(new Date(item.created_date), "MMM d, yyyy")}
                  </span>
                </div>
                
                <p className="text-slate-700 mb-3 leading-relaxed">{item.feedback_text}</p>
                
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  {item.customer_name && (
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{item.customer_name}</span>
                    </div>
                  )}
                  {item.customer_email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      <span>{item.customer_email}</span>
                    </div>
                  )}
                  {item.source && (
                    <Badge variant="outline" className="text-xs">
                      {item.source.replace(/_/g, " ")}
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}