import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send, Calendar, DollarSign, User, Trash2 } from "lucide-react";
import { useState } from "react";

interface Booking {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  bookingReference: string;
  paymentStatus: string;
  bookingStatus: string;
  totalAmount: string;
  startDate?: string;
  endDate?: string;
  confirmationEmailSent: boolean;
  reminderEmailSent: boolean;
  createdAt: string;
  quoteId?: number;
}

export default function AdminBookings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusUpdate, setStatusUpdate] = useState<{ [key: number]: string }>({});

  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const sendConfirmationMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      await apiRequest("POST", `/api/bookings/${bookingId}/send-confirmation`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Confirmation email sent successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const sendReminderMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      await apiRequest("POST", `/api/bookings/${bookingId}/send-reminder`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Reminder email sent successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const sendStatusUpdateMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: number; status: string }) => {
      await apiRequest("POST", `/api/bookings/${bookingId}/send-status-update`, { status });
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Success",
        description: "Status update email sent successfully",
      });
      setStatusUpdate(prev => ({ ...prev, [variables.bookingId]: "" }));
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteBookingMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      await apiRequest("DELETE", `/api/bookings/${bookingId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Booking deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "default";
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      case "confirmed":
        return "default";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Booking Management</h1>
        <p className="text-muted-foreground">Manage bookings and send email notifications</p>
      </div>

      <div className="grid gap-6">
        {bookings?.map((booking) => (
          <Card key={booking.id} className="p-6">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {booking.customerName} - {booking.bookingReference}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge variant={getStatusBadgeVariant(booking.paymentStatus)}>
                    {booking.paymentStatus}
                  </Badge>
                  <Badge variant={getStatusBadgeVariant(booking.bookingStatus)}>
                    {booking.bookingStatus}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{booking.customerEmail}</p>
                    {booking.customerPhone && (
                      <p className="text-xs text-muted-foreground">{booking.customerPhone}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">${booking.totalAmount}</p>
                    <p className="text-xs text-muted-foreground">Total Amount</p>
                  </div>
                </div>
                
                {booking.startDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(booking.startDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">Start Date</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      Confirmation: {booking.confirmationEmailSent ? "✓" : "✗"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Reminder: {booking.reminderEmailSent ? "✓" : "✗"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Email Actions</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => sendConfirmationMutation.mutate(booking.id)}
                    disabled={sendConfirmationMutation.isPending}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Confirmation
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => sendReminderMutation.mutate(booking.id)}
                    disabled={sendReminderMutation.isPending}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Reminder
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Enter status update message..."
                    value={statusUpdate[booking.id] || ""}
                    onChange={(e) =>
                      setStatusUpdate(prev => ({ ...prev, [booking.id]: e.target.value }))
                    }
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    onClick={() =>
                      sendStatusUpdateMutation.mutate({
                        bookingId: booking.id,
                        status: statusUpdate[booking.id] || "",
                      })
                    }
                    disabled={
                      !statusUpdate[booking.id] || sendStatusUpdateMutation.isPending
                    }
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Update
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {!bookings?.length && (
          <div className="text-center py-12">
            <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No bookings found</h3>
            <p className="text-muted-foreground">
              Bookings will appear here when customers make reservations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}