import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

type Props = {
  leftVector: number[];
  rightVector: number[];
  leftText: string;
  rightText: string;
};

export const VectorsPreviewDialog = ({
  leftVector,
  rightVector,
  leftText,
  rightText,
}: Props) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg">
          View Vectors
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Vector Representation</DialogTitle>
          <DialogDescription>
            The numerical representation of the input texts.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Vector 1:</h4>
            <p className="text-sm break-all">
              [{leftVector.map((v) => v.toFixed(4)).join(", ")}]
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Vector 2:</h4>
            <p className="text-sm break-all">
              [{rightVector.map((v) => v.toFixed(4)).join(", ")}]
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
