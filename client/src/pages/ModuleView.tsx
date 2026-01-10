import { PageHeader } from "@/components/PageHeader";
import { useModule, useForms, useCreateForm } from "@/hooks/use-erp";
import { Link, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertFormSchema, type InsertForm } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";

export default function ModuleView() {
  const [, params] = useRoute("/modules/:id");
  const moduleId = Number(params?.id);
  
  const { data: module, isLoading: moduleLoading } = useModule(moduleId);
  const { data: forms, isLoading: formsLoading } = useForms(moduleId);
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();
  const createForm = useCreateForm();

  const form = useForm<Omit<InsertForm, "moduleId" | "fields">>({
    resolver: zodResolver(insertFormSchema.pick({ name: true, description: true })),
    defaultValues: { name: "", description: "" },
  });

  const onSubmit = (data: Omit<InsertForm, "moduleId" | "fields">) => {
    createForm.mutate(
      { ...data, moduleId, fields: [] },
      {
        onSuccess: () => {
          setIsCreateOpen(false);
          form.reset();
          toast({ title: "Form Created", description: "Start designing your form now." });
        },
        onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
      }
    );
  };

  if (moduleLoading || formsLoading) return <div className="p-8">Loading...</div>;
  if (!module) return <div className="p-8">Module not found</div>;

  return (
    <div className="p-8">
      <PageHeader
        title={module.name}
        description={module.description || "Manage forms and records for this module."}
        actions={
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                <Icons.Plus className="mr-2 h-4 w-4" />
                Create New Form
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Form</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Form Name</FormLabel>
                        <FormControl><Input placeholder="e.g. Employee Onboarding" {...field} /></FormControl>
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
                        <FormControl><Input placeholder="Brief description..." {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={createForm.isPending}>
                    {createForm.isPending ? "Creating..." : "Create Form"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
      />

      {forms?.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 border-2 border-dashed border-border rounded-3xl bg-muted/30">
          <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
            <Icons.FilePlus2 className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">No forms yet</h3>
          <p className="text-muted-foreground text-center max-w-sm mb-6">
            Get started by creating your first form to collect data for this module.
          </p>
          <Button variant="outline" onClick={() => setIsCreateOpen(true)}>Create First Form</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {forms?.map((form) => (
            <Card key={form.id} className="border-border/50 hover:border-primary/50 transition-colors shadow-sm hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-bold">{form.name}</CardTitle>
                <Icons.FileText className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                  {form.description || "No description provided."}
                </CardDescription>
                <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Icons.Layout className="w-4 h-4" />
                    {(form.fields as any[])?.length || 0} Fields
                  </span>
                  {/* Would need another query for records count, skipping for speed */}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t bg-muted/20 p-4">
                <Link href={`/forms/${form.id}/design`}>
                  <Button variant="outline" size="sm" className="bg-white">
                    <Icons.PenTool className="w-3.5 h-3.5 mr-2" />
                    Design
                  </Button>
                </Link>
                <Link href={`/forms/${form.id}/records`}>
                  <Button size="sm" className={cn(
                    "bg-primary hover:bg-primary/90",
                    ((form.fields as any[])?.length || 0) === 0 && "opacity-50 cursor-not-allowed"
                  )}>
                    View Records
                    <Icons.ArrowRight className="w-3.5 h-3.5 ml-2" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
