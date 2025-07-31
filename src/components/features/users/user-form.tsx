"use client";

import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ROLES } from "@/constants/roles";

type Props = {
  initialValues?: any;
  onSubmit: (data: any) => void;
};

export function UserForm({ initialValues, onSubmit }: Props) {
  const { register, handleSubmit } = useForm({
    defaultValues: initialValues || {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: ROLES.SUPPORT_AGENT,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>First Name</Label>
        <Input {...register("firstName")} required />
      </div>
      <div>
        <Label>Last Name</Label>
        <Input {...register("lastName")} required />
      </div>
      <div>
        <Label>Email</Label>
        <Input {...register("email")} required type="email" />
      </div>
      <div>
        <Label>Password</Label>
        <Input {...register("password")} type="password" required />
      </div>
      <div>
        <Label>Role</Label>
        <select
          {...register("role")}
          className="w-full border rounded px-2 py-1"
        >
          {Object.values(ROLES).map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit">Save</Button>
    </form>
  );
}
