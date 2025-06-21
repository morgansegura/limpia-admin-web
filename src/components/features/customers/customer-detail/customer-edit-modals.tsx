import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Customer } from "@/types/customer.types";
import { CustomerInfoForm } from "./forms/customer-info-form";
import { CustomerAddressForm } from "./forms/customer-address-form";
import { CustomerPreferencesForm } from "./forms/customer-preferences-form";

type ModalKey = "info" | "address" | "preferences" | null;

export function CustomerEditModals({
  customer,
  activeModal,
  setActiveModal,
  onSuccess,
}: {
  customer: Customer;
  activeModal: ModalKey;
  setActiveModal: (key: ModalKey) => void;
  onSuccess: () => void;
}) {
  return (
    <>
      <Dialog
        open={activeModal === "info"}
        onOpenChange={() => setActiveModal(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Info</DialogTitle>
          </DialogHeader>
          <CustomerInfoForm customer={customer} onSuccess={onSuccess} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={activeModal === "address"}
        onOpenChange={() => setActiveModal(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Address</DialogTitle>
          </DialogHeader>
          <CustomerAddressForm customer={customer} onSuccess={onSuccess} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={activeModal === "preferences"}
        onOpenChange={() => setActiveModal(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Preferences</DialogTitle>
          </DialogHeader>
          <CustomerPreferencesForm customer={customer} onSuccess={onSuccess} />
        </DialogContent>
      </Dialog>
    </>
  );
}
