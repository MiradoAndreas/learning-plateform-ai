import { Spinner } from "@/components/ui/spinner";

type GeneratingIndicatorProps = {
  label: string;
};

export const GeneratingIndicator = ({ label }: GeneratingIndicatorProps) => {
  return (
    <div className="flex h-[100px] flex-col items-center justify-center gap-y-2 text-sm text-muted-foreground">
      <Spinner />
      <p>{label}</p>
    </div>
  );
};
