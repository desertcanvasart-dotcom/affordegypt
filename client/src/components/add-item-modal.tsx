import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalType: 'vehicle' | 'guide' | 'addon' | 'city' | 'route';
}

export default function AddItemModal({ isOpen, onClose, modalType }: AddItemModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    unitType: 'per_unit'
  });
  const { toast } = useToast();

  const handleSubmit = () => {
    if (formData.name.trim()) {
      toast({
        title: "Success!",
        description: `${modalType === 'addon' ? 'Service' : modalType} "${formData.name}" has been added successfully.`,
      });
      handleClose();
    } else {
      toast({
        title: "Error",
        description: "Please enter a name for the item.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      unitType: 'per_unit'
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Add New {modalType === 'addon' ? 'Service' : modalType === 'vehicle' ? 'Vehicle Type' : modalType === 'guide' ? 'Guide Rate' : modalType === 'city' ? 'City' : 'Route'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="modal-name">Name</Label>
            <Input 
              id="modal-name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
              placeholder={modalType === 'addon' ? 'Service name...' : modalType === 'vehicle' ? 'Vehicle type...' : modalType === 'city' ? 'City name...' : 'Route name...'}
            />
          </div>
          
          <div>
            <Label htmlFor="modal-description">Description</Label>
            <Textarea 
              id="modal-description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
              placeholder="Enter description..."
            />
          </div>

          <div>
            <Label htmlFor="modal-price">Price (USD)</Label>
            <Input 
              id="modal-price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({...prev, price: e.target.value}))}
              placeholder="0.00"
            />
          </div>

          {modalType === 'addon' && (
            <>
              <div>
                <Label htmlFor="modal-category">Category</Label>
                <Select onValueChange={(value) => setFormData(prev => ({...prev, category: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="experience">Experience</SelectItem>
                    <SelectItem value="meal">Meal</SelectItem>
                    <SelectItem value="ticket">Ticket</SelectItem>
                    <SelectItem value="transport">Transport</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="modal-unitType">Pricing Type</Label>
                <Select onValueChange={(value) => setFormData(prev => ({...prev, unitType: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pricing type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="per_unit">Per Unit</SelectItem>
                    <SelectItem value="per_person">Per Person</SelectItem>
                    <SelectItem value="per_trip">Per Trip</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Add {modalType === 'addon' ? 'Service' : modalType === 'vehicle' ? 'Vehicle' : modalType === 'guide' ? 'Guide' : modalType === 'city' ? 'City' : 'Route'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}