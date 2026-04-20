import { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@app/components/v3";
import { OrgPermissionActions } from "@app/context/OrgPermissionContext/types";

import { TFormSchema, TOrgPermissionAction, TPermissionsKey } from "../OrgRoleModifySection.utils";

enum Permission {
  NoAccess = "no-access",
  ReadOnly = "read-only",
  FullAccess = "full-access",
  Custom = "custom"
}

type Props = {
  subject: TPermissionsKey;
  actions: readonly TOrgPermissionAction[];
  isDisabled?: boolean;
};

export const OrgPermissionQuickSelect = ({ subject, actions, isDisabled }: Props) => {
  const { setValue, trigger, getValues } = useFormContext<TFormSchema>();
  const permissions = useWatch({ name: "permissions" });
  const rule = permissions?.[subject]?.[0] as Record<string, boolean> | undefined;

  const selectedPermissionCategory = useMemo(() => {
    if (!rule) return Permission.NoAccess;
    const score = actions.filter(({ value }) => rule[value]).length;
    if (score === 0) return Permission.NoAccess;
    if (score === actions.length) return Permission.FullAccess;
    if (score === 1 && rule[OrgPermissionActions.Read]) return Permission.ReadOnly;
    return Permission.Custom;
  }, [rule, actions]);

  const selectedCount = actions.filter(({ value }) => rule?.[value]).length;

  const setSubjectPermission = (
    value: NonNullable<TFormSchema["permissions"]>[TPermissionsKey]
  ) => {
    const current = getValues("permissions") ?? {};
    setValue(
      "permissions",
      { ...current, [subject]: value } as NonNullable<TFormSchema["permissions"]>,
      {
        shouldDirty: true
      }
    );
    trigger("permissions");
  };

  const handlePermissionChange = (val: Permission) => {
    if (val === Permission.Custom) return;

    if (val === Permission.NoAccess) {
      setSubjectPermission(undefined);
      return;
    }

    const allTrue = Object.fromEntries(actions.map(({ value }) => [value, true]));

    const next =
      val === Permission.FullAccess
        ? allTrue
        : {
            ...Object.fromEntries(actions.map(({ value }) => [value, false])),
            [OrgPermissionActions.Read]: true
          };

    setSubjectPermission([next] as NonNullable<TFormSchema["permissions"]>[TPermissionsKey]);
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
      <SelectContent
        position="popper"
        className="border border-mineshaft-600 bg-mineshaft-800 text-left"
      >
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
