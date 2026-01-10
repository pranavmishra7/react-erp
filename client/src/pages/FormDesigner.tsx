import { PageHeader } from "@/components/PageHeader";
import { useForm, useUpdateForm } from "@/hooks/use-erp";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { type FormField } from "@shared/schema";
import * as Icons from "lucide-react";

export default function FormDesigner() {
  const [, params] = useRoute("/forms/:id/design");
  const formId = Number(params?.id);
  const { data: form, isLoading } = useForm(formId);
  const updateForm = useUpdateForm();
  const { toast } = useToast();

  const [fields, setFields] = useState<FormField[]>([]);
  const [activeField, setActiveField] = useState<number | null>(null);

  useEffect(() => {
    if (form?.fields) {
      setFields(form.fields as FormField[]);
    }
  }, [form]);

  const addField = () => {
    const newField: FormField = {
      key: `field_${Date.now()}`,
      label: "New Field",
      type: "text",
      required: false,
    };
    setFields([...fields, newField]);
    setActiveField(fields.length);
  };

  const updateField = (index: number, updates: Partial<FormField>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFields(newFields);
  };

  const removeField = (index: number) => {
    const newFields = [...fields];
    newFields.splice(index, 1);
    setFields(newFields);
    setActiveField(null);
  };

  const saveForm = () => {
    if (!form) return;
    updateForm.mutate(
      { id: form.id, fields },
      {
        onSuccess: () => toast({ title: "Saved", description: "Form layout updated successfully." }),
        onError: () => toast({ title: "Error", description: "Failed to save form.", variant: "destructive" }),
      }
    );
  };

  if (isLoading || !form) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 h-screen flex flex-col overflow-hidden">
      <div className="flex-none">
        <PageHeader
          title={`Design: ${form.name}`}
          description="Drag and drop fields to build your data entry form."
          actions={
            <Button onClick={saveForm} disabled={updateForm.isPending} className="shadow-lg shadow-primary/20">
              {updateForm.isPending ? "Saving..." : "Save Changes"}
            </Button>
          }
        />
      </div>

      <div className="flex-1 flex gap-8 overflow-hidden">
        {/* Preview / Canvas */}
        <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-border/50 shadow-sm p-8">
          <div className="max-w-2xl mx-auto space-y-6">
            {fields.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground border-2 border-dashed border-border rounded-xl">
                Click "Add Field" to start building your form
              </div>
            ) : (
              fields.map((field, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveField(idx)}
                  className={`relative p-6 rounded-xl border-2 transition-all cursor-pointer group ${
                    activeField === idx
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-transparent hover:border-border hover:bg-muted/30"
                  }`}
                >
                  <div className="flex flex-col gap-2 pointer-events-none">
                    <Label className="text-base font-semibold">
                      {field.label} {field.required && <span className="text-destructive">*</span>}
                    </Label>
                    {field.type === "text" && <Input disabled placeholder="Text input..." />}
                    {field.type === "number" && <Input disabled type="number" placeholder="0" />}
                    {field.type === "textarea" && <div className="h-20 bg-muted/20 rounded-md border border-input p-2 text-sm text-muted-foreground">Text area...</div>}
                    {field.type === "date" && <div className="h-10 bg-muted/20 rounded-md border border-input flex items-center px-3 text-muted-foreground"><Icons.Calendar className="w-4 h-4 mr-2" /> Pick a date</div>}
                    {field.type === "select" && (
                      <div className="h-10 bg-muted/20 rounded-md border border-input flex items-center px-3 justify-between text-muted-foreground">
                        Select option... <Icons.ChevronDown className="w-4 h-4" />
                      </div>
                    )}
                    {field.type === "checkbox" && (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border border-input rounded bg-muted/20" />
                        <span className="text-sm text-muted-foreground">Checkbox label</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); removeField(idx); }} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                      <Icons.Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="max-w-2xl mx-auto mt-8">
             <Button variant="outline" onClick={addField} className="w-full border-dashed border-2 py-8 hover:bg-muted/30 hover:border-primary/50 text-muted-foreground hover:text-primary">
                <Icons.Plus className="w-5 h-5 mr-2" /> Add New Field
             </Button>
          </div>
        </div>

        {/* Properties Panel */}
        <div className="w-80 flex-none bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-muted/10 font-semibold text-sm">
            Field Properties
          </div>
          <div className="p-6 flex-1 overflow-y-auto">
            {activeField !== null && fields[activeField] ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Label</Label>
                  <Input
                    value={fields[activeField].label}
                    onChange={(e) => updateField(activeField, { label: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Field Type</Label>
                  <Select
                    value={fields[activeField].type}
                    onValueChange={(val: any) => updateField(activeField, { type: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text Input</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="textarea">Text Area</SelectItem>
                      <SelectItem value="date">Date Picker</SelectItem>
                      <SelectItem value="select">Dropdown Select</SelectItem>
                      <SelectItem value="checkbox">Checkbox</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Variable Key</Label>
                  <Input
                    value={fields[activeField].key}
                    onChange={(e) => updateField(activeField, { key: e.target.value })}
                    className="font-mono text-xs"
                  />
                  <p className="text-xs text-muted-foreground">Unique identifier for data storage.</p>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="required"
                    checked={fields[activeField].required}
                    onCheckedChange={(checked) => updateField(activeField, { required: !!checked })}
                  />
                  <Label htmlFor="required" className="cursor-pointer">Required Field</Label>
                </div>

                {fields[activeField].type === 'select' && (
                  <div className="space-y-2 pt-4 border-t">
                    <Label>Options (comma separated)</Label>
                    <Input
                      value={fields[activeField].options?.join(', ') || ''}
                      onChange={(e) => updateField(activeField, { 
                        options: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
                      })}
                      placeholder="Option 1, Option 2..."
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-muted-foreground text-sm py-10">
                Select a field to edit its properties.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
