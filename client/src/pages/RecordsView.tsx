import { PageHeader } from "@/components/PageHeader";
import { useForm, useRecords, useCreateRecord } from "@/hooks/use-erp";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { FormField } from "@shared/schema";
import * as Icons from "lucide-react";

export default function RecordsView() {
  const [, params] = useRoute("/forms/:id/records");
  const formId = Number(params?.id);
  
  const { data: form } = useForm(formId);
  const { data: records, isLoading } = useRecords(formId);
  const createRecord = useCreateRecord();
  const { toast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const fields = (form?.fields as FormField[]) || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRecord.mutate(
      { formId, data: formData },
      {
        onSuccess: () => {
          setIsOpen(false);
          setFormData({});
          toast({ title: "Success", description: "Record added successfully." });
        },
        onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
      }
    );
  };

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Render form input based on type
  const renderInput = (field: FormField) => {
    switch (field.type) {
      case "text":
        return <Input 
          required={field.required} 
          onChange={(e) => handleInputChange(field.key, e.target.value)} 
        />;
      case "number":
        return <Input 
          type="number" 
          required={field.required} 
          onChange={(e) => handleInputChange(field.key, Number(e.target.value))} 
        />;
      case "textarea":
        return <Textarea 
          required={field.required} 
          onChange={(e) => handleInputChange(field.key, e.target.value)} 
        />;
      case "select":
        return (
          <Select onValueChange={(val) => handleInputChange(field.key, val)}>
            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              {field.options?.map(opt => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox 
              id={field.key} 
              onCheckedChange={(checked) => handleInputChange(field.key, checked)} 
            />
            <Label htmlFor={field.key} className="cursor-pointer font-normal">Yes</Label>
          </div>
        );
      case "date":
        return <Input 
          type="date" 
          required={field.required} 
          onChange={(e) => handleInputChange(field.key, e.target.value)} 
        />;
      default:
        return <Input />;
    }
  };

  if (isLoading || !form) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <PageHeader
        title={form.name}
        description="View and manage submitted records."
        actions={
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-lg shadow-primary/20">
                <Icons.Plus className="mr-2 h-4 w-4" />
                Add Record
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>New Entry: {form.name}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                {fields.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label>
                      {field.label} {field.required && <span className="text-destructive">*</span>}
                    </Label>
                    {renderInput(field)}
                  </div>
                ))}
                <Button type="submit" className="w-full mt-4" disabled={createRecord.isPending}>
                  {createRecord.isPending ? "Saving..." : "Save Record"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-[80px]">ID</TableHead>
              {fields.slice(0, 5).map(field => (
                <TableHead key={field.key}>{field.label}</TableHead>
              ))}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={fields.length + 2} className="h-32 text-center text-muted-foreground">
                  No records found. Add your first entry!
                </TableCell>
              </TableRow>
            ) : (
              records?.map((record) => {
                const data = record.data as any;
                return (
                  <TableRow key={record.id} className="hover:bg-muted/10">
                    <TableCell className="font-mono text-xs text-muted-foreground">#{record.id}</TableCell>
                    {fields.slice(0, 5).map(field => (
                      <TableCell key={field.key}>
                        {typeof data[field.key] === 'boolean' 
                          ? (data[field.key] ? "Yes" : "No")
                          : String(data[field.key] || "-")}
                      </TableCell>
                    ))}
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Icons.MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
