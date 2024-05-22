/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Form } from "@remix-run/react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { ICurrentUser } from "~/routes/sessions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type EquipmentFormProps = {
  method: "post" | "get";
  action: string;
  user: ICurrentUser;
  equipment?: any;
  submitButton: React.ReactNode;
};

export function EquipmentForm({
  submitButton,
  method,
  action,
  user,
  equipment,
}: EquipmentFormProps) {
  return (
    <Form
      method={method}
      action={action}
      className="flex flex-col gap-6 mt-8 bg-slate-50 drop-shadow-md p-4 rounded-md"
    >
      {equipment ? (
        <input type="hidden" name="equipmentId" value={equipment.id} />
      ) : null}
      <input type="hidden" name="creator" value={user.userId} />
      <div className="flex flex-col space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          placeholder="name"
          defaultValue={equipment?.name ?? ""}
          required
        />
      </div>
      <div className="flex flex-col space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="equipment description"
          defaultValue={equipment?.description ?? ""}
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

      <div className="flex flex-col space-y-1.5">
        <Label htmlFor="unit">Quantity</Label>
        <Input
          type="number"
          min={0}
          id="quantity"
          name="quantity"
          placeholder="Quantity"
          defaultValue={equipment?.quantity ?? ""}
          required
        />
      </div>
      {equipment ? (
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <Select name="status">
            <SelectTrigger id="status">
              <SelectValue placeholder={equipment.status} />
            </SelectTrigger>
            <SelectContent position="popper">
              {["AVAILABLE", "IN_USE", "MAINTENANCE"].map(
                (s: string, i: number) => (
                  <SelectItem key={i} value={s}>
                    {s}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>
      ) : null}
      {submitButton}
    </Form>
  );
}
