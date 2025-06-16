# Bulk Transfer Routes CSV Import Guide

## CSV Format Requirements

Use this exact column order and format for importing transfer routes:

### Required Columns:
1. **route_name** - Descriptive name for the route
2. **from_city_name** - Source city name (must match existing city)
3. **to_city_name** - Destination city name (must match existing city)
4. **from_location** - Specific pickup location
5. **to_location** - Specific dropoff location
6. **distance_km** - Distance in kilometers (number only)
7. **trip_mode** - One of: transfer, day_trip, overnight, multi_day
8. **sedan_price** - Price in EGP for Sedan (1-2 pax)
9. **minivan_price** - Price in EGP for Minivan (3-8 pax)
10. **van_price** - Price in EGP for Van (9-15 pax)
11. **coach_price** - Price in EGP for Coach (16-35 pax)
12. **estimated_duration** - Travel time estimate
13. **route_highlights** - Key attractions or features
14. **travel_tips** - Helpful travel advice
15. **pickup_instructions** - Where to meet driver
16. **dropoff_instructions** - Where to be dropped off
17. **display_order** - Sorting order (number)

### Available Cities:
- Cairo, Alexandria, Luxor, Aswan, Hurghada, Sharm El Sheikh
- Marsa Alam, EL Fayoum, St. Catherine, Dahab, Esna, El Gouna
- Beni Suef, Al Minya, Sohag, Asyut, Qena, Kom Ombo, Edfu
- Abu Simbel, Bahariya Oasis, Dakhla Oasis, Siwa Oasis, Safaga
- Qusier, Ain Al Sokhna, Ras Sudr, Kharga Oasis, El alamein
- Nuweiba, Taba

### Vehicle Types & Passenger Limits:
- **Sedan**: 1-2 passengers
- **Minivan**: 3-8 passengers  
- **Van**: 9-15 passengers
- **Coach**: 16-35 passengers

### Trip Mode Options:
- **transfer** - Simple A to B transfer (0 nights)
- **day_trip** - Day excursion returning same day (0 nights)
- **overnight** - Overnight stay required (1 night)
- **multi_day** - Multi-day tour (2+ nights)

### Pricing Guidelines:
- All prices in Egyptian Pounds (EGP)
- No decimals - whole numbers only
- Price should increase: Sedan < Minivan < Van < Coach
- Consider distance, duration, and trip complexity

### Example Row:
```
Cairo Airport Transfer,Cairo,Cairo,Cairo International Airport,Downtown Hotels,45,transfer,350,450,650,950,1 hour,Direct route through New Cairo,Traffic heavy 4-6 PM,Terminal arrivals area,Hotel lobby,1
```

### Important Notes:
- City names must match exactly (case-sensitive)
- No empty cells allowed
- Prices are base rates before any surcharges
- Duration format: "X hours" or "X minutes"
- Display order: lower numbers appear first