import { Link, useLocation } from "wouter";
import { useModules } from "@/hooks/use-erp";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateModule } from "@/hooks/use-erp";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertModuleSchema, type InsertModule } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

// Helper to render Lucide icons dynamically
const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = (Icons as any)[name] || Icons.Box;
  return <IconComponent className={className} />;
};

export function Sidebar() {
  const [location] = useLocation();
  const { data: modules, isLoading } = useModules();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();
  const createModule = useCreateModule();

  const form = useForm<InsertModule>({
    resolver: zodResolver(insertModuleSchema),
    defaultValues: {
      name: "",
      description: "",
      icon: "Box",
    },
  });

  const onSubmit = (data: InsertModule) => {
    createModule.mutate(data, {
      onSuccess: () => {
        setIsCreateOpen(false);
        form.reset();
        toast({ title: "Module Created", description: `${data.name} is now available.` });
      },
      onError: (err) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      },
    });
  };

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-sidebar border-r border-sidebar-border/10 flex flex-col z-50 bg-white/95 backdrop-blur-sm shadow-xl shadow-black/5">
      <div className="p-6 border-b border-sidebar-border/10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
            <Icons.LayoutDashboard className="w-6 h-6" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-foreground">
            Nexus ERP
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
        {/* Main Navigation */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-3">
            Overview
          </h4>
          <Link href="/">
            <div
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                location === "/"
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icons.PieChart className="w-5 h-5" />
              Dashboard
            </div>
          </Link>
          <Link href="/modules">
            <div
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                location === "/modules"
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icons.Settings2 className="w-5 h-5" />
              Settings
            </div>
          </Link>
        </div>

        {/* Modules Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-3 mb-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Modules
            </h4>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 hover:bg-primary/10 hover:text-primary rounded-full"
                >
                  <Icons.Plus className="w-3 h-3" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Module</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Module Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Inventory" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input placeholder="Manage stock levels..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="icon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Icon Name (Lucide)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Package" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={createModule.isPending}>
                      {createModule.isPending ? "Creating..." : "Create Module"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="px-3 text-sm text-muted-foreground">Loading...</div>
          ) : (
            modules?.map((module) => (
              <Link key={module.id} href={`/modules/${module.id}`}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer group",
                    location.startsWith(`/modules/${module.id}`)
                      ? "bg-white border border-border/50 text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <div className={cn(
                    "p-1.5 rounded-md transition-colors",
                    location.startsWith(`/modules/${module.id}`)
                      ? "bg-primary/10 text-primary"
                      : "bg-transparent group-hover:bg-muted-foreground/10"
                  )}>
                    <DynamicIcon name={module.icon} className="w-4 h-4" />
                  </div>
                  {module.name}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      <div className="p-4 border-t border-sidebar-border/10">
        <div className="bg-primary/5 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center text-white font-bold text-xs">
              JD
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">John Doe</p>
              <p className="text-xs text-muted-foreground">Admin</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
