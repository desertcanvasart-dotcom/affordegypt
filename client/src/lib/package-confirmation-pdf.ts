import { jsPDF } from "jspdf";
import type { TravelPackage, PackagePricing } from "@shared/travel-packages";
type Translate = (key: string, options?: Record<string, unknown>) => string;
type Booking = {bookingReference:string;bookingStatus:string;totalAmount:string|number;customerName:string;customerEmail:string;customerPhone:string;customerNotes?:string;startDate?:string;endDate?:string};
type Snapshot = {package:TravelPackage;pricing:PackagePricing;travelers:number;rooms:{double:number;single:number};specialRequests?:string;itinerary?:{cityName:string;date:string;description:string}[]};
// WinAnsi fonts support all four site languages; normalize unsupported punctuation.
const clean = (value: unknown) => String(value ?? "").replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/[–—]/g,"-").replace(/•/g,"-").replace(/\u00a0/g," ");
export function createPackageConfirmationPDF(booking: Booking, snapshot: Snapshot, t: Translate) {
  const pdf = new jsPDF({unit:"mm",format:"a4"});
  const left=18, width=174, bottom=275;
  let y=29;
  const pageHeader=()=>{
    pdf.setFillColor(13,115,109);pdf.rect(0,0,210,19,"F");
    pdf.setFont("helvetica","bold");pdf.setFontSize(15);pdf.setTextColor(255,255,255);pdf.text("AffordEgypt",left,12);
    pdf.setFontSize(8);pdf.text(clean(booking.bookingReference),192,12,{align:"right"});
    pdf.setTextColor(35,45,55);
  };
  pageHeader();
  const ensure=(height:number)=>{if(y+height>bottom){pdf.addPage();pageHeader();y=29;}};
  const text=(value:unknown,size=10,bold=false)=>{
    pdf.setFont("helvetica",bold?"bold":"normal");pdf.setFontSize(size);
    const lines=pdf.splitTextToSize(clean(value),width) as string[];
    const lineHeight=size*0.48;
    for(const line of lines){ensure(lineHeight);pdf.setFont("helvetica",bold?"bold":"normal");pdf.setFontSize(size);pdf.text(line,left,y);y+=lineHeight;}
    y+=2;
  };
  const heading=(value:string)=>{ensure(22);y+=4;pdf.setTextColor(13,115,109);text(value,13,true);pdf.setDrawColor(207,224,220);pdf.line(left,y-1,left+width,y-1);y+=3;pdf.setTextColor(35,45,55);};
  const label=(key:string,value:unknown)=>text(`${t(key).replace(/:$/, "")}: ${clean(value)}`);
  const money=(value:unknown)=>`EGP ${Number(value).toLocaleString("en-GB",{minimumFractionDigits:2,maximumFractionDigits:2})}`;
  text(t("bookingConfirmation.pdf.title"),19,true);
  text(snapshot.package.title,15,true);
  text(t("packages.requestNote"),9);
  heading(t("bookingConfirmation.pdf.bookingInformation"));
  label("bookingConfirmation.pdf.referenceLabel",booking.bookingReference);
  label("bookingConfirmation.pdf.status",booking.bookingStatus.replace(/_/g," ").toUpperCase());
  label("bookingConfirmation.pdf.totalAmount",money(booking.totalAmount));
  if(booking.startDate)label("bookingConfirmation.pdf.startDate",booking.startDate.slice(0,10));
  if(booking.endDate)label("bookingConfirmation.pdf.endDate",booking.endDate.slice(0,10));
  text(t("packages.duration",{days:snapshot.package.durationDays,nights:snapshot.package.nights}));
  label("packages.travelers",snapshot.travelers ?? snapshot.pricing.travelers);
  text(t("packages.roomOption",{double:snapshot.rooms.double,single:snapshot.rooms.single}));
  label("packages.perPerson",money(snapshot.pricing.basePerPerson));
  label("packages.baseTotal",money(snapshot.pricing.baseTotal));
  label("packages.supplementTotal",money(snapshot.pricing.supplementTotal));
  heading(t("bookingConfirmation.pdf.customerInformation"));
  label("bookingConfirmation.pdf.name",booking.customerName);
  label("bookingConfirmation.pdf.email",booking.customerEmail);
  label("bookingConfirmation.pdf.phone",booking.customerPhone);
  if(snapshot.specialRequests || booking.customerNotes)label("packages.requests",snapshot.specialRequests || booking.customerNotes);
  heading(t("packages.itinerary"));
  const itinerary=snapshot.itinerary?.length?snapshot.itinerary:snapshot.package.itinerary.map(day=>({cityName:day.title,date:"",description:day.description}));
  itinerary.forEach((day,index)=>{
    ensure(30);text(`${t("packages.day",{day:index+1})} - ${day.cityName}`,11,true);
    if(day.date)label("bookingConfirmation.pdf.date",day.date);
    text(day.description);y+=3;
  });
  for(const key of ["inclusions","exclusions"] as const){heading(t(`packages.${key}`));for(const item of snapshot.package[key] || [])text(`- ${item}`);}
  heading(t("packages.terms"));
  text(snapshot.package.bookingTerms,9);
  heading(t("bookingConfirmation.pdf.contactInformation"));
  text("+20 110 076 5283 | hello@affordegypt.com");
  text(t("bookingConfirmation.pdf.thanks"),9);
  const pages=pdf.getNumberOfPages();
  for(let page=1;page<=pages;page++){
    pdf.setPage(page);pdf.setFont("helvetica","normal");pdf.setFontSize(8);pdf.setTextColor(100,110,120);
    pdf.setDrawColor(220,228,226);pdf.line(left,282,192,282);
    pdf.text("affordegypt.com",left,288);pdf.text(`${page} / ${pages}`,192,288,{align:"right"});
  }
  return pdf;
}
