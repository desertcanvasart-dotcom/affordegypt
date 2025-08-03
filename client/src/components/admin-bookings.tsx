import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Mail, 
  Phone, 
  Eye, 
  Edit3,
  Send,
  Filter,
  Download,
  Trash2,
  CreditCard
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AdminBooking {
  id: number;
  bookingReference: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  paymentStatus: string;
  bookingStatus: string;
  totalAmount: string;
  startDate?: string;
  endDate?: string;
  confirmationEmailSent: boolean;
  reminderEmailSent: boolean;
  createdAt: string;
  quote?: {
    id: number;
    jsonBlob: any;
    total: string;
    commissionPct: string;
  };
}

export default function AdminBookings() {
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: bookings = [], isLoading } = useQuery<AdminBooking[]>({
    queryKey: ["/api/admin/bookings"]
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: number, status: string }) => {
      return await apiRequest("PUT", `/api/bookings/${bookingId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
      toast({
        title: "Status Updated",
        description: "Booking status has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update booking status",
        variant: "destructive",
      });
    }
  });

  const updatePaymentStatusMutation = useMutation({
    mutationFn: async ({ bookingId, paymentStatus }: { bookingId: number, paymentStatus: string }) => {
      return await apiRequest("PUT", `/api/bookings/${bookingId}/payment-status`, { paymentStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
      toast({
        title: "Payment Status Updated",
        description: "Payment status has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update payment status",
        variant: "destructive",
      });
    }
  });

  const sendReminderMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      return await apiRequest("POST", `/api/bookings/${bookingId}/send-reminder`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
      toast({
        title: "Reminder Sent",
        description: "Booking reminder email has been sent",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send reminder email",
        variant: "destructive",
      });
    }
  });

  const deleteBookingMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      return await apiRequest("DELETE", `/api/bookings/${bookingId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
      toast({
        title: "Booking Deleted",
        description: "Booking has been deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete booking",
        variant: "destructive",
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredBookings = bookings
    .filter(booking => {
      if (statusFilter === "all") return true;
      if (statusFilter === "payment") return booking.paymentStatus === 'pending';
      if (statusFilter === "upcoming") return booking.startDate && new Date(booking.startDate) > new Date();
      if (statusFilter === "completed") return booking.bookingStatus === 'completed';
      return booking.bookingStatus === statusFilter;
    })
    .filter(booking => 
      booking.bookingReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.paymentStatus === 'pending').length,
    confirmed: bookings.filter(b => b.bookingStatus === 'confirmed').length,
    completed: bookings.filter(b => b.bookingStatus === 'completed').length,
    revenue: bookings
      .filter(b => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + parseFloat(b.totalAmount), 0)
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Booking Management</h2>
          <p className="text-muted-foreground">
            Manage customer bookings and track payments
          </p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending Payment</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.confirmed}</p>
                <p className="text-xs text-muted-foreground">Confirmed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">${stats.revenue.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Bookings</Label>
              <Input
                id="search"
                placeholder="Search by reference, name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Label>Filter by Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Bookings</SelectItem>
                  <SelectItem value="payment">Pending Payment</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground">No bookings found matching your criteria.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredBookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {booking.customerName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {booking.bookingReference} • Booked on {formatDate(booking.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Amount</p>
                        <p className="font-semibold">{Math.round(parseFloat(booking.totalAmount))} EGP</p>
                      </div>
                      
                      {booking.startDate && (
                        <div>
                          <p className="text-sm text-muted-foreground">Trip Start</p>
                          <p className="font-semibold">{formatDate(booking.startDate)}</p>
                        </div>
                      )}
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Payment</p>
                        <Badge className={getStatusColor(booking.paymentStatus)} variant="secondary">
                          {booking.paymentStatus.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge className={getBookingStatusColor(booking.bookingStatus)} variant="secondary">
                          {booking.bookingStatus.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Contact</p>
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="w-3 h-3" />
                          {booking.confirmationEmailSent ? (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          ) : (
                            <Clock className="w-3 h-3 text-yellow-500" />
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Reminder</p>
                        <div className="flex items-center gap-1 text-sm">
                          <Send className="w-3 h-3" />
                          {booking.reminderEmailSent ? (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          ) : (
                            <Clock className="w-3 h-3 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedBooking(booking)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    
                    <Select
                      value={booking.bookingStatus}
                      onValueChange={(status) => updateStatusMutation.mutate({ bookingId: booking.id, status })}
                    >
                      <SelectTrigger className="w-32">
                        <Edit3 className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select
                      value={booking.paymentStatus}
                      onValueChange={(paymentStatus) => updatePaymentStatusMutation.mutate({ bookingId: booking.id, paymentStatus })}
                    >
                      <SelectTrigger className="w-32">
                        <CreditCard className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => sendReminderMutation.mutate(booking.id)}
                      disabled={sendReminderMutation.isPending}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Reminder
                    </Button>
                    
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete booking ${booking.bookingReference}? This action cannot be undone.`)) {
                          deleteBookingMutation.mutate(booking.id);
                        }
                      }}
                      disabled={deleteBookingMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Booking
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <BookingDetailsModal 
          booking={selectedBooking} 
          onClose={() => setSelectedBooking(null)} 
        />
      )}
    </div>
  );
}

function BookingDetailsModal({ 
  booking, 
  onClose 
}: { 
  booking: AdminBooking, 
  onClose: () => void 
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Booking Details - {booking.bookingReference}</CardTitle>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Customer Information */}
          <div>
            <h4 className="font-medium mb-3">Customer Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <p className="text-lg">{booking.customerName}</p>
              </div>
              <div>
                <Label>Email</Label>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{booking.customerEmail}</span>
                </div>
              </div>
              {booking.customerPhone && (
                <div>
                  <Label>Phone</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{booking.customerPhone}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Booking Information */}
          <div>
            <h4 className="font-medium mb-3">Booking Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Total Amount</Label>
                <p className="text-2xl font-bold text-green-600">{Math.round(parseFloat(booking.totalAmount))} EGP</p>
              </div>
              <div>
                <Label>Payment Status</Label>
                <Badge className={booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} variant="secondary">
                  {booking.paymentStatus.toUpperCase()}
                </Badge>
              </div>
              <div>
                <Label>Booking Status</Label>
                <Badge variant="outline">
                  {booking.bookingStatus.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              {booking.startDate && (
                <div>
                  <Label>Trip Start Date</Label>
                  <p className="text-lg">{new Date(booking.startDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                </div>
              )}
              {booking.endDate && (
                <div>
                  <Label>Trip End Date</Label>
                  <p className="text-lg">{new Date(booking.endDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Trip Details */}
          {booking.quote && (
            <div>
              <h4 className="font-medium mb-3">Trip Details</h4>
              <div className="space-y-4">
                {booking.quote.jsonBlob?.itinerary && (
                  <div>
                    <h5 className="text-sm font-medium mb-2">Itinerary</h5>
                    <div className="space-y-2">
                      {Array.isArray(booking.quote.jsonBlob.itinerary) ? booking.quote.jsonBlob.itinerary.map((item: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <span className="font-medium">{item.city || item.route || `Service ${index + 1}`}</span>
                            {item.description && (
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {item.date || `Day ${index + 1}`}
                          </span>
                        </div>
                      )) : (
                        <div className="p-3 bg-gray-50 rounded-lg text-sm text-muted-foreground">
                          No itinerary data available
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {booking.quote.jsonBlob?.addons && booking.quote.jsonBlob.addons.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium mb-2">Add-ons</h5>
                    <div className="space-y-1">
                      {booking.quote.jsonBlob.addons.map((addon: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span>{addon.name}</span>
                          <span className="text-sm text-muted-foreground font-medium">
                            EGP {addon.price}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Communication Status */}
          <div>
            <h4 className="font-medium mb-3">Communication Status</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium">Confirmation Email</p>
                  <p className={`text-sm ${booking.confirmationEmailSent ? "text-green-600" : "text-yellow-600"}`}>
                    {booking.confirmationEmailSent ? "Sent" : "Pending"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Send className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="font-medium">Reminder Email</p>
                  <p className={`text-sm ${booking.reminderEmailSent ? "text-green-600" : "text-gray-600"}`}>
                    {booking.reminderEmailSent ? "Sent" : "Not sent"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}