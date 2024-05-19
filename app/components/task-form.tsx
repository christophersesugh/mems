/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Form } from "@remix-run/react";
import { format } from "date-fns";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "~/shadcn";
import { FaCalendarAlt } from "react-icons/fa";
import { Calendar } from "./ui/calendar";
import { ICurrentUser } from "~/routes/sessions";

type TaskFormProps = {
  method: "post" | "get";
  action: string;
  user: ICurrentUser;
  users: any;
  task?: any;
  submitButton: React.ReactNode;
};

export function TaskForm({
  submitButton,
  method,
  action,
  user,
  users,
  task,
}: TaskFormProps) {
  const [date, setDate] = React.useState<Date>(
    new Date(task?.date ?? Date.now())
  );
  const [assignees, setAssignees] = React.useState<string>(
    task?.assignees?.map((a: any) => a.user.id).join(",") ?? ""
  );

  return (
    <Form
      method={method}
      action={action}
      className="flex flex-col gap-6 mt-8 bg-slate-50 drop-shadow-md p-4 rounded-md"
    >
      {task ? <input type="hidden" name="taskId" value={task.id} /> : null}
      <input type="hidden" name="assigner" value={user.userId} />
      <div className="flex flex-col space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          placeholder="Title"
          defaultValue={task?.title ?? ""}
          required
        />
      </div>
      <div className="flex flex-col space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Task description"
          defaultValue={task?.description ?? ""}
          rows={5}
          required
        />
      </div>
      <div className="flex flex-col space-y-1.5">
        <Label htmlFor="unit">Unit</Label>
        <Input
          id="unit"
          name="unit"
          placeholder="Unit"
          defaultValue={user.unit}
          value={user.unit}
          readOnly
          required
        />
      </div>
      <input type="hidden" name="date" value={String(date)} />
      <div className="flex flex-col space-y-1.5">
        <Label htmlFor="date">Recurring task date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <FaCalendarAlt className="mr-2 h-4 w-4" />
              {date ? format(date, "do MMMM, yyyy") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              required
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col space-y-1.5">
        <input type="hidden" name="assignees" value={assignees} required />
        <Label htmlFor="assignees">Assignees</Label>
        <Select
          name="assignees"
          onValueChange={(v) => {
            const value = String(v);
            setAssignees((prevAssignees) => {
              // Split the existing string into an array, filter out empty strings
              const assigneesArray = prevAssignees
                ? prevAssignees?.split(",").filter(Boolean)
                : [];
              // Add the new value
              assigneesArray.push(value);
              // Create a Set to remove duplicates and join back into a comma-separated string
              return Array.from(new Set(assigneesArray)).join(",");
            });
          }}
        >
          <SelectTrigger id="assignees">
            <SelectValue placeholder="Select assignee(s)" />
          </SelectTrigger>
          <SelectContent position="popper">
            {users.map((u: any) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ul>
          {assignees?.length
            ? assignees
                ?.split(",")
                .filter(Boolean)
                ?.map((a: string, i: number) => <li key={i}>{a}</li>)
            : null}
        </ul>
      </div>
      <Select />
      {submitButton}
    </Form>
  );
}
