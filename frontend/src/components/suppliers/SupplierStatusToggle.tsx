
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

interface SupplierStatusToggleProps {
  supplierId: string;
  initialStatus: string;
  onStatusChange?: (newStatus: string) => void;
}

const SupplierStatusToggle = ({ 
  supplierId, 
  initialStatus, 
  onStatusChange 
}: SupplierStatusToggleProps) => {
  const [isActive, setIsActive] = useState(initialStatus.toLowerCase() === "active");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleStatus = async () => {
    const newStatus = !isActive ? "Active" : "Inactive";
    setIsUpdating(true);
    
    try {
      const { error } = await supabase
        .from('suppliers')
        .update({ status: newStatus })
        .eq('id', supplierId);
      
      if (error) throw error;

      setIsActive(!isActive);
      toast({
        title: "Status updated",
        description: `Supplier is now ${newStatus}`,
      });
      
      if (onStatusChange) {
        onStatusChange(newStatus);
      }
    } catch (error) {
      console.error('Error updating supplier status:', error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Could not update supplier status.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Switch 
        checked={isActive} 
        onCheckedChange={handleToggleStatus}
        disabled={isUpdating}
        aria-label={`Set supplier ${isActive ? 'inactive' : 'active'}`}
      />
      <span className="text-sm text-muted-foreground">
        {isActive ? 'Active' : 'Inactive'}
      </span>
    </div>
  );
};

export default SupplierStatusToggle;
