import React from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, TrendingUp, Tag, ThumbsUp, ThumbsDown, Minus, User, Mail } from "lucide-react";

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

function FeedbackItem({ feedback }) {
  return (
    <div className="p-5 border border-slate-200 rounded-xl hover:shadow-md transition-all duration-200 bg-white">
      <div className="flex flex-wrap gap-2 mb-3">
        <Badge className={`${urgencyColors[feedback.urgency]} border font-medium`}>
          <AlertCircle className="w-3 h-3 mr-1" />
          {feedback.urgency.toUpperCase()}
        </Badge>
        {feedback.impact && (
          <Badge className={`${urgencyColors[feedback.impact]} border font-medium`}>
            <TrendingUp className="w-3 h-3 mr-1" />
            Impact: {feedback.impact}
          </Badge>
        )}
        {feedback.category && (
          <Badge className={`${categoryColors[feedback.category]} border font-medium`}>
            <Tag className="w-3 h-3 mr-1" />
            {feedback.category.replace(/_/g, " ")}
          </Badge>
        )}
        {feedback.sentiment && (
          <Badge variant="outline" className="border font-medium">
            {feedback.sentiment === "positive" && <ThumbsUp className="w-3 h-3 mr-1 text-emerald-600" />}
            {feedback.sentiment === "negative" && <ThumbsDown className="w-3 h-3 mr-1 text-red-600" />}
            {feedback.sentiment === "neutral" && <Minus className="w-3 h-3 mr-1 text-amber-600" />}
            {feedback.sentiment}
          </Badge>
        )}
      </div>
      
      <p className="text-slate-700 mb-3 leading-relaxed">{feedback.feedback_text}</p>
      
      <div className="flex items-center gap-4 text-sm text-slate-500">
        {feedback.customer_name && (
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>{feedback.customer_name}</span>
          </div>
        )}
        {feedback.customer_email && (
          <div className="flex items-center gap-1">
            <Mail className="w-4 h-4" />
            <span>{feedback.customer_email}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ClassifiedResults({ results }) {
  return (
    <Tabs defaultValue="high" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-slate-100">
        <TabsTrigger value="high" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
          High ({results.high.length})
        </TabsTrigger>
        <TabsTrigger value="medium" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white">
          Medium ({results.medium.length})
        </TabsTrigger>
        <TabsTrigger value="low" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
          Low ({results.low.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="high" className="mt-6 space-y-4">
        {results.high.length === 0 ? (
          <p className="text-center text-slate-500 py-8">No high urgency feedback</p>
        ) : (
          results.high.map((feedback, index) => (
            <FeedbackItem key={index} feedback={feedback} />
          ))
        )}
      </TabsContent>

      <TabsContent value="medium" className="mt-6 space-y-4">
        {results.medium.length === 0 ? (
          <p className="text-center text-slate-500 py-8">No medium urgency feedback</p>
        ) : (
          results.medium.map((feedback, index) => (
            <FeedbackItem key={index} feedback={feedback} />
          ))
        )}
      </TabsContent>

      <TabsContent value="low" className="mt-6 space-y-4">
        {results.low.length === 0 ? (
          <p className="text-center text-slate-500 py-8">No low urgency feedback</p>
        ) : (
          results.low.map((feedback, index) => (
            <FeedbackItem key={index} feedback={feedback} />
          ))
        )}
      </TabsContent>
    </Tabs>
  );
}