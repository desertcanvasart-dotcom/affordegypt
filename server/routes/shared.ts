import { authenticateToken, requireAdmin } from "../auth";

// Admin auth middleware chain — [authenticateToken, requireAdmin]. Shared
// across the split route modules so each spreads the same gate:
//   app.post("/api/admin/x", ...adminAuth, handler)
export const adminAuth = [authenticateToken, requireAdmin];
