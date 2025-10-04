import { Dialog, DialogContent } from "@/components/ui/dialog";

export function QuoteModal(props) {
  // ...extrae aquí la lógica y JSX del modal de cotización...
  return (
    <Dialog open={props.quoteModalOpen} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-w-3xl">
        {/* ...contenido del modal... */}
      </DialogContent>
    </Dialog>
  );
}