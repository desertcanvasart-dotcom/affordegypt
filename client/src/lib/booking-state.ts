import { create } from 'zustand';
import { BookingData } from '@/types/booking';

interface BookingState {
  bookingData: BookingData;
  updateTransportation: (data: Partial<BookingData>) => void;
  updateGuide: (data: Partial<BookingData>) => void;
  updateAddOns: (addOns: Array<{id: number, quantity: number}>) => void;
  updateCustomerInfo: (data: Partial<BookingData>) => void;
  resetBooking: () => void;
}

const initialBookingData: BookingData = {
  // Transportation
  fromCityId: null,
  toCityId: null,
  routeId: null,
  vehicleTypeId: null,
  transportType: null,
  transportHours: 1,
  passengerCount: 1,
  
  // Location
  cityId: null,
  
  // Guide
  tourGuideId: null,
  guideType: null,
  guideLanguage: null,
  guideDays: 0,
  guideHours: 8,
  
  // Attractions
  selectedAttractions: [],
  
  // Add-ons
  selectedAddOns: [],
  
  // Travelers
  travelers: 1,
  
  // Customer info
  customerName: '',
  customerEmail: '',
  customerPhone: '',
};

export const useBookingState = create<BookingState>((set) => ({
  bookingData: initialBookingData,
  
  updateTransportation: (data) =>
    set((state) => ({
      bookingData: { ...state.bookingData, ...data }
    })),
  
  updateGuide: (data) =>
    set((state) => ({
      bookingData: { ...state.bookingData, ...data }
    })),
  
  updateAddOns: (addOns) =>
    set((state) => ({
      bookingData: { ...state.bookingData, selectedAddOns: addOns }
    })),
  
  updateCustomerInfo: (data) =>
    set((state) => ({
      bookingData: { ...state.bookingData, ...data }
    })),
  
  resetBooking: () =>
    set({ bookingData: initialBookingData }),
}));
