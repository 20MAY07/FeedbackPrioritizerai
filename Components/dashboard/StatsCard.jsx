import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const colorClasses = {
  blue: "from-blue-500 to-blue-600",
  red: "from-red-500 to-red-600",
  green: "from-emerald-500 to-emerald-600",
  purple: "from-purple-500 to-purple-600"
};

export default function StatsCard({ title, value, icon: Icon, color, isLoading }) {
  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur overflow-hidden group hover:shadow-2xl transition-all duration-300">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClasses[color]} opacity-10 rounded-full transform translate-x-12 -translate-y-12 group-hover:scale-110 transition-transform duration-300`} />
      <CardContent className="p-6 relative">
        <div className="flex justify-between items-start mb-4">
          <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">{title}</p>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} bg-opacity-10`}>
            <Icon className={`w-5 h-5 text-${color === 'blue' ? 'blue' : color === 'red' ? 'red' : color === 'green' ? 'emerald' : 'purple'}-600`} />
          </div>
        </div>
        {isLoading ? (
          <Skeleton className="h-10 w-24" />
        ) : (
          <p className="text-4xl font-bold text-slate-900">{value}</p>
        )}
      </CardContent>
    </Card>
  );
}