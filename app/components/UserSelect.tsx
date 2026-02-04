import { Select } from "@base-ui/react/select";

type User = {
  id: string;
  username: string;
};

type UserSelectProps = {
  users: User[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  placeholder?: string;
  name?: string;
  variant?: "default" | "inline";
};

export function UserSelect({
  users,
  selectedIds,
  onChange,
  placeholder = "Select users...",
  name,
  variant = "default",
}: UserSelectProps) {
  const selectedUsers = users.filter((u) => selectedIds.includes(u.id));

  const triggerClassName =
    variant === "inline"
      ? "flex items-center gap-1 text-sm bg-transparent border-none outline-none cursor-pointer text-left"
      : "flex items-center justify-between gap-2 px-3 py-2 border border-[#ccc] focus:border-black data-[popup-open]:border-black bg-white text-sm min-w-[200px] cursor-pointer text-left outline-none";

  return (
    <>
      {name &&
        selectedIds.map((id) => (
          <input key={id} type="hidden" name={name} value={id} />
        ))}
      <Select.Root
        multiple
        value={selectedIds}
        onValueChange={(value: string[]) => onChange(value)}
      >
        <Select.Trigger className={triggerClassName}>
          <Select.Value placeholder={placeholder}>
            {selectedUsers.length === 0
              ? placeholder
              : selectedUsers.map((u) => u.username).join(", ")}
          </Select.Value>
          <Select.Icon>
            <ChevronIcon />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner sideOffset={4} alignItemWithTrigger={false}>
            <Select.Popup className="border bg-white shadow-lg min-w-[var(--anchor-width)] max-h-[300px] overflow-auto">
              <Select.List className="divide-y">
                {users.map((user) => (
                  <Select.Item
                    key={user.id}
                    value={user.id}
                    className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer data-[highlighted]:bg-gray-100"
                  >
                    <Select.ItemIndicator className="w-4">
                      <CheckIcon />
                    </Select.ItemIndicator>
                    <Select.ItemText>{user.username}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.List>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    </>
  );
}

function ChevronIcon() {
  return (
    <svg
      width="10"
      height="6"
      viewBox="0 0 10 6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M1 1L5 5L9 1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
      <path d="M10.3 1.9a1 1 0 0 1 .2 1.4l-5 6a1 1 0 0 1-1.5.1L1.3 6.7a1 1 0 1 1 1.4-1.4l2 2 4.2-5.2a1 1 0 0 1 1.4-.2Z" />
    </svg>
  );
}
