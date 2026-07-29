"use client";

export function DeleteButton({
  action,
  confirmMessage = "Confirmer la suppression ?",
  label = "Supprimer",
}: {
  action: () => Promise<void>;
  confirmMessage?: string;
  label?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      <button type="submit" className="btn-danger">
        {label}
      </button>
    </form>
  );
}
