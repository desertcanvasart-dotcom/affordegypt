import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("./email-client", () => ({ mailService: {send:vi.fn().mockResolvedValue(undefined)} }));
import { mailService } from "./email-client";
import { emailService } from "./email-service";
const booking={id:1,bookingReference:"PKG-TEST",customerName:"Test Traveler",customerEmail:"qa@example.com",customerPhone:"12345678",totalAmount:"3300.00",startDate:new Date("2027-01-10"),endDate:new Date("2027-01-12"),bookingStatus:"pending",paymentStatus:"pending"};
afterEach(()=>{vi.unstubAllEnvs();vi.clearAllMocks();});
describe("package confirmation policy",()=>{
 it("uses frozen package terms and room counts without promising the planner deposit policy",async()=>{
  vi.stubEnv("RESEND_API_KEY","local-test-only");
  const quote={jsonBlob:{package:{title:"Test program",bookingTerms:"Package payment terms supplied by the operator."},travelers:3,rooms:{double:1,single:1},pricing:{supplementTotal:300},specialRequests:"No special requests"}};
  expect(await emailService.sendBookingConfirmation(booking as any,quote as any)).toBe(true);
  const messages=vi.mocked(mailService.send).mock.calls.map(([data])=>data);
  expect(messages).toHaveLength(2);
  for(const message of messages){
   expect(message.html).toContain("Test program");
   expect(message.html).toContain("Package payment terms supplied by the operator.");
   expect(message.html).toContain("Single rooms");
   expect(message.html).not.toContain("10%");
   expect(message.html).not.toContain("fully refundable up to 3 days");
  }
 });
 it("keeps the existing planner confirmation policy",async()=>{
  vi.stubEnv("RESEND_API_KEY","local-test-only");
  expect(await emailService.sendBookingConfirmation(booking as any,{jsonBlob:{}} as any)).toBe(true);
  expect(vi.mocked(mailService.send).mock.calls[0][0].html).toContain("10%");
 });
});
