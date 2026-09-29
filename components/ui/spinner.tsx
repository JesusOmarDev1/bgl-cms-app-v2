import { MaterialIcon } from "@/components/shared/assets/icons/MaterialIcon"

function Spinner({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span data-slot="spinner" role="status" className={className} {...props}>
      <span className="sr-only">Loading</span>
      <MaterialIcon
        name="progress_activity"
        size={16}
        className="animate-spin"
      />
    </span>
  )
}

export { Spinner }
