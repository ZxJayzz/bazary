"use client";

import Link from "next/link";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  href?: string;
}

export default function StatsCard({ title, value, icon, color = "bg-primary/10 text-primary", href }: StatsCardProps) {
  const content = (
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
      </div>
      <div className={`shrink-0 w-11 h-11 rounded-lg flex items-center justify-center ${color}`}>
        {icon}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-primary/30 transition-all p-5 cursor-pointer">
        {content}
      </Link>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5">
      {content}
    </div>
  );
}
