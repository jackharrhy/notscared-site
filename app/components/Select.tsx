import { Select as BaseSelect } from "@base-ui/react/select";

type Option = {
  value: string;
  label: string;
};

type SelectProps = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  name?: string;
  variant?: "default" | "inline";
  className?: string;
};

export function Select({
  options,
  value,
  onChange,
  placeholder,
  name,
  variant = "default",
  className = "",
}: SelectProps) {
  const selectedOption = options.find((o) => o.value === value);

  const triggerClassName =
    variant === "inline"
      ? `flex items-center gap-1 text-sm bg-transparent border-none outline-none cursor-pointer text-left ${className}`
      : `flex items-center justify-between gap-2 px-3 py-2 border border-[#ccc] focus:border-black data-[popup-open]:border-black bg-white text-sm min-w-[200px] cursor-pointer text-left outline-none ${className}`;

  return (
    <>
      {name && <input type="hidden" name={name} value={value} />}
      <BaseSelect.Root
        value={value}
        onValueChange={(val: string | null) => val && onChange(val)}
      >
        <BaseSelect.Trigger className={triggerClassName}>
          <BaseSelect.Value placeholder={placeholder}>
            {selectedOption?.label || placeholder}
          </BaseSelect.Value>
          <BaseSelect.Icon>
            <ChevronIcon />
          </BaseSelect.Icon>
        </BaseSelect.Trigger>
        <BaseSelect.Portal>
          <BaseSelect.Positioner sideOffset={4} alignItemWithTrigger={false}>
            <BaseSelect.Popup className="border bg-white shadow-lg min-w-[var(--anchor-width)] max-h-[300px] overflow-auto">
              <BaseSelect.List className="divide-y">
                {options.map((option) => (
                  <BaseSelect.Item
                    key={option.value}
                    value={option.value}
                    className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer data-[highlighted]:bg-gray-100"
                  >
                    <BaseSelect.ItemIndicator className="w-4">
                      <CheckIcon />
                    </BaseSelect.ItemIndicator>
                    <BaseSelect.ItemText>{option.label}</BaseSelect.ItemText>
                  </BaseSelect.Item>
                ))}
              </BaseSelect.List>
            </BaseSelect.Popup>
          </BaseSelect.Positioner>
        </BaseSelect.Portal>
      </BaseSelect.Root>
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
