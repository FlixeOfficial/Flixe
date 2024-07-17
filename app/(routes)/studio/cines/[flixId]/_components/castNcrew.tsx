"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";  // Utility function to conditionally apply class names
import minifyText from '@/lib/minify';

// Dummy array of people
const people = [
  { name: "Akash", email: "0xcf0f17740aef0bb68888a604e2bc63a30574c8d9" },
  { name: "Harsh", email: "0x90b8873c3606697297b2b58c189737c5d4d8630b" },
  { name: "Jeya", email: "0x307f96216367b83b6856342a00f6c522ac7e17e0" },
  { name: "CTD", email: "0xb641bb54fba6046ff4f42035006db4f2537d0bdb" },
];

const formSchema = z.object({
  castAndCrew: z.array(
    z.object({
      role: z.string().min(1, { message: "Role is required" }),
      person: z.object({
        name: z.string().min(1, { message: "Name is required" }),
        email: z.string().min(1, { message: "Email is required" }),
      }),
      share: z.number().min(0.00001, { message: "Share must be at least 0.00001" }),
      isPercentage: z.boolean(),
    })
  ).min(1, { message: "At least one cast or crew is required" }),
});

type CastCrewFormProps = {
  initialData: {
    castAndCrew: Array<{
      role: string;
      person: {
        name: string;
        email: string;
      };
      share: number;
      isPercentage: boolean;
    }>;
  };
  flixId: string;
};

export const CastCrewForm: React.FC<CastCrewFormProps> = ({ initialData, flixId }) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "castAndCrew",
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/flixs/${flixId}`, values);
      toast({
        title: "Flix updated",
        description: "The flix cast and crew have been successfully updated.",
      });
      toggleEdit();
      router.refresh();
    } catch {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
      });
    }
  };

  return (
    <div className="mt-2 border bg-background rounded-md p-4">
      <div className="flex items-center justify-between font-semibold text-lg">
        Cast & Crew
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit cast & crew
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <div>
          {initialData.castAndCrew.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2 mt-2">
              <p className="text-sm">{entry.role}</p>
              <p className="text-sm">{entry.person.name}</p>
              <p className="text-sm">{entry.share}</p>
              <p className="text-sm">{entry.isPercentage ? "%" : "TFUEL"}</p>
            </div>
          ))}
        </div>
      )}
      {isEditing && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center space-x-2">
                <FormField
                  control={form.control}
                  name={`castAndCrew.${index}.role`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Role" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`castAndCrew.${index}.person`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select
                          onValueChange={(value) => field.onChange(JSON.parse(value))}
                          value={JSON.stringify(field.value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select person" />
                          </SelectTrigger>
                          <SelectContent>
                            {people.map((person, idx) => (
                              <SelectItem key={idx} value={JSON.stringify(person)}>
                                {person.name} ({minifyText(person.email)})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`castAndCrew.${index}.share`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="number" step="0.00001" min="0.00001" placeholder="Share" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`castAndCrew.${index}.isPercentage`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex items-center border rounded-md overflow-hidden">
                          <Button
                            type="button"
                            className={cn("rounded-none", field.value && "bg-blue-500 text-white")}
                            onClick={() => field.onChange(true)}
                          >
                            %
                          </Button>
                          <Button
                            type="button"
                            className={cn("rounded-none", !field.value && "bg-blue-500 text-white")}
                            onClick={() => field.onChange(false)}
                          >
                            TFUEL
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {fields.length > 1 && (
                  <Button variant="ghost" type="button" onClick={() => remove(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" onClick={() => append({ role: "", person: people[0], share: 0.00001, isPercentage: false })}>
              Add Cast/Crew
            </Button>
            <div className="flex items-center gap-x-2 justify-end">
              <Button disabled={!isValid || isSubmitting} type="submit">
                Save
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};