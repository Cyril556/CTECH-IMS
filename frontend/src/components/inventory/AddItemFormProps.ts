
import { Tables } from "@/types/Database.types";

export interface AddItemFormProps {
  onSuccess?: () => void;
  editMode?: boolean;
  itemData?: Tables<'inventory_items'> & {
    categories?: {
      id: string;
      name: string;
    } | null;
    suppliers?: {
      id: string;
      name: string;
    } | null;
  };
}
