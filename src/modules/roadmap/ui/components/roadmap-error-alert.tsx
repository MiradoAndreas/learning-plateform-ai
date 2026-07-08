import { AlertCircleIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type RoadmapErrorAlertProps = {
  message: string;
};

export const RoadmapErrorAlert = ({ message }: RoadmapErrorAlertProps) => {
  return (
    <Alert variant="destructive">
      <AlertCircleIcon className="h-4 w-4" />
      <AlertTitle>Génération impossible</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};
