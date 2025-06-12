import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, CheckCircle, AlertCircle, MapPin, Mail, Phone, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

interface UserBooking {
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

export default function UserDashboard() {
  const [selectedBooking, setSelectedBooking] = useState<UserBooking | null>(null);
  
  // For demo purposes, using userId 1. In real app, this would come from auth context
  const userId = 1;

  const { data: bookings = [], isLoading } = useQuery<UserBooking[]>({
    queryKey: [`/api/user/${userId}/bookings`]
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const upcomingBookings = bookings.filter(booking => 
    booking.startDate && new Date(booking.startDate) > new Date() && 
    booking.bookingStatus !== 'cancelled'
  );

  const pastBookings = bookings.filter(booking => 
    !booking.startDate || new Date(booking.startDate) <= new Date() || 
    booking.bookingStatus === 'completed'
  );

  const pendingBookings = bookings.filter(booking => 
    booking.paymentStatus === 'pending' || booking.bookingStatus === 'confirmed'
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Bookings
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your Egypt travel bookings and view trip details.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{upcomingBookings.length}</p>
                  <p className="text-sm text-muted-foreground">Upcoming Trips</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{pastBookings.length}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{pendingBookings.length}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <MapPin className="w-8 h-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{bookings.length}</p>
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start planning your Egypt adventure today!
                </p>
                <Button onClick={() => window.location.href = '/'}>
                  Plan Your Trip
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">All Bookings ({bookings.length})</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming ({upcomingBookings.length})</TabsTrigger>
              <TabsTrigger value="past">Past ({pastBookings.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingBookings.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <BookingsList bookings={bookings} onViewDetails={setSelectedBooking} />
            </TabsContent>

            <TabsContent value="upcoming">
              <BookingsList bookings={upcomingBookings} onViewDetails={setSelectedBooking} />
            </TabsContent>

            <TabsContent value="past">
              <BookingsList bookings={pastBookings} onViewDetails={setSelectedBooking} />
            </TabsContent>

            <TabsContent value="pending">
              <BookingsList bookings={pendingBookings} onViewDetails={setSelectedBooking} />
            </TabsContent>
          </Tabs>
        )}

        {/* Booking Details Modal */}
        {selectedBooking && (
          <BookingDetailsModal 
            booking={selectedBooking} 
            onClose={() => setSelectedBooking(null)} 
          />
        )}
      </div>
    </div>
  );
}

function BookingsList({ 
  bookings, 
  onViewDetails 
}: { 
  bookings: UserBooking[], 
  onViewDetails: (booking: UserBooking) => void 
}) {
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

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">No bookings found in this category.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Card key={booking.id} className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">
                      Booking {booking.bookingReference}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Booked on {formatDate(booking.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="font-semibold">{booking.totalAmount} EGP</p>
                  </div>
                  
                  {booking.startDate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Trip Start</p>
                      <p className="font-semibold">{formatDate(booking.startDate)}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Status</p>
                    <Badge className={getStatusColor(booking.paymentStatus)} variant="secondary">
                      {booking.paymentStatus.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Booking Status</p>
                    <Badge className={getBookingStatusColor(booking.bookingStatus)} variant="secondary">
                      {booking.bookingStatus.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onViewDetails(booking)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = `/booking/${booking.bookingReference}`}
                >
                  View Confirmation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function BookingDetailsModal({ 
  booking, 
  onClose 
}: { 
  booking: UserBooking, 
  onClose: () => void 
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Booking Details - {booking.bookingReference}</CardTitle>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Customer Information */}
          <div>
            <h4 className="font-medium mb-3">Contact Information</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{booking.customerEmail}</span>
              </div>
              {booking.customerPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{booking.customerPhone}</span>
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
                      {booking.quote.jsonBlob.itinerary.map((item: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span>{item.city || item.route || `Service ${index + 1}`}</span>
                          <span className="text-sm text-muted-foreground">
                            {item.date || `Day ${index + 1}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {booking.quote.jsonBlob?.addons && booking.quote.jsonBlob.addons.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium mb-2">Add-ons</h5>
                    <div className="space-y-1">
                      {booking.quote.jsonBlob.addons.map((addon: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <span>{addon.name}</span>
                          <span className="text-sm text-muted-foreground">
                            ${addon.price}
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

          {/* Status Information */}
          <div>
            <h4 className="font-medium mb-3">Status Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Confirmation Email</p>
                <p className={booking.confirmationEmailSent ? "text-green-600" : "text-yellow-600"}>
                  {booking.confirmationEmailSent ? "Sent" : "Pending"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reminder Email</p>
                <p className={booking.reminderEmailSent ? "text-green-600" : "text-gray-600"}>
                  {booking.reminderEmailSent ? "Sent" : "Not sent"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}