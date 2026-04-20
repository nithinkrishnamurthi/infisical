import { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@app/components/v3";
import { OrgPermissionActions } from "@app/context/OrgPermissionContext/types";

import { TOrgPermissionAction, TFormSchema } from "../OrgRoleModifySection.utils";

enum Permission {
  NoAccess = "no-access",
  ReadOnly = "read-only",
  FullAccess = "full-access",
  Custom = "custom"
}

type Props = {
  subject: string;
  actions: readonly TOrgPermissionAction[];
  isDisabled?: boolean;
};

export const OrgPermissionQuickSelect = ({ subject, actions, isDisabled }: Props) => {
  const { setValue, trigger } = useFormContext<TFormSchema>();
  const rule = useWatch({ name: `permissions.${subject}.0` as never }) as
    | Record<string, boolean>
    | undefined;

  const selectedPermissionCategory = useMemo(() => {
    if (!rule) return Permission.NoAccess;
    const score = actions.filter(({ value }) => rule[value]).length;
    if (score === 0) return Permission.NoAccess;
    if (score === actions.length) return Permission.FullAccess;
    if (score === 1 && rule[OrgPermissionActions.Read]) return Permission.ReadOnly;
    return Permission.Custom;
  }, [rule, actions]);

  const selectedCount = actions.filter(({ value }) => rule?.[value]).length;

  const handlePermissionChange = (val: Permission) => {
    if (val === Permission.Custom) return;

    const allFalse = Object.fromEntries(actions.map(({ value }) => [value, false]));
    const allTrue = Object.fromEntries(actions.map(({ value }) => [value, true]));

    const next =
      val === Permission.FullAccess
        ? allTrue
        : val === Permission.ReadOnly
          ? { ...allFalse, [OrgPermissionActions.Read]: true }
          : allFalse;

    setValue(`permissions.${subject}.0` as never, next as never, { shouldDirty: true });
    trigger("permissions");
  };

  return (
    <Select
      value={selectedPermissionCategory}
      onValueChange={handlePermissionChange}
      disabled={isDisabled}
    >
      <SelectTrigger className="h-8 w-40 bg-mineshaft-700">
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper" className="border border-mineshaft-600 bg-mineshaft-800 text-left">
        <SelectItem value={Permission.NoAccess}>No Access</SelectItem>
        <SelectItem value={Permission.ReadOnly}>Read Only</SelectItem>
        <SelectItem value={Permission.FullAccess}>Full Access</SelectItem>
        <SelectItem value={Permission.Custom}>
          {selectedPermissionCategory === Permission.Custom
            ? `Custom (${selectedCount})`
            : "Custom"}
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
