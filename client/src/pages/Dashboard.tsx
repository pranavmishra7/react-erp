import { PageHeader } from "@/components/PageHeader";
import { useModules } from "@/hooks/use-erp";
import * as Icons from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: modules } = useModules();

  const stats = [
    { label: "Total Modules", value: modules?.length || 0, icon: Icons.Package, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Active Forms", value: 12, icon: Icons.FileText, color: "text-green-500", bg: "bg-green-50" },
    { label: "Records", value: 148, icon: Icons.Database, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "System Health", value: "98%", icon: Icons.Activity, color: "text-orange-500", bg: "bg-orange-50" },
  ];

  return (
    <div className="p-8">
      <PageHeader
        title="Dashboard"
        description="Welcome back. Here's an overview of your enterprise system."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                This Month
              </span>
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-1">{stat.value}</h3>
            <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-display font-bold text-foreground mb-6">Quick Access Modules</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules?.map((module) => {
          const Icon = (Icons as any)[module.icon] || Icons.Box;
          return (
            <Link key={module.id} href={`/modules/${module.id}`}>
              <div className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full group">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-primary/5 text-primary rounded-xl group-hover:bg-primary group-hover:text-white transition-colors">
                    <Icon className="w-8 h-8" />
                  </div>
                  <Icons.ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {module.name}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {module.description || "Manage operations and data for this module."}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
