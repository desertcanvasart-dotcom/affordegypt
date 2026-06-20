import type { Express } from "express";
import { storage } from "../database-storage";
import { validateBody } from "../middleware/validate";
import { reviewRequestSchema, adminReviewSchema } from "../request-schemas";
import { adminAuth } from "./shared";

// Customer reviews: public read + public submission, plus admin
// moderation/import. Extracted from routes.ts (see refactor: split routes).
export function registerReviewRoutes(app: Express): void {
  app.get("/api/reviews", async (req, res) => {
    try {
      const reviews = await storage.getActiveReviews();
      res.json(reviews);
    } catch (error: any) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.get("/api/reviews/all", ...adminAuth, async (req, res) => {
    try {
      const reviews = await storage.getAllReviews();
      res.json(reviews);
    } catch (error: any) {
      console.error("Error fetching all reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Public review submission. Whitelist user-submittable fields and force the
  // moderation flags server-side — a public caller must never be able to set
  // isVerified/isActive (no self-"verified" reviews, no mass-assignment of
  // other columns). Admins seed those via POST /api/admin/reviews below.
  app.post("/api/reviews", validateBody(reviewRequestSchema), async (req, res) => {
    try {
      const review = await storage.createReview({
        customerName: req.body.customerName,
        customerLocation: req.body.customerLocation ?? null,
        rating: Number(req.body.rating),
        title: req.body.title,
        content: req.body.content,
        tripDate: req.body.tripDate ? new Date(req.body.tripDate) : null,
        isVerified: false,
        isActive: true,
      });
      res.json(review);
    } catch (error: any) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Admin review creation / CSV bulk import (admin-reviews page). Unlike the
  // public endpoint, this is adminAuth-gated and accepts isVerified/isActive.
  app.post(
    "/api/admin/reviews",
    ...adminAuth,
    validateBody(adminReviewSchema),
    async (req, res) => {
      try {
        const reviewData = {
          ...req.body,
          tripDate: req.body.tripDate ? new Date(req.body.tripDate) : null,
        };
        const review = await storage.createReview(reviewData);
        res.json(review);
      } catch (error: any) {
        console.error("Error creating admin review:", error);
        res.status(500).json({ message: "Failed to create review" });
      }
    },
  );

  app.put("/api/reviews/:id", ...adminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const reviewData = {
        ...req.body,
        tripDate: req.body.tripDate ? new Date(req.body.tripDate) : null,
      };
      const review = await storage.updateReview(id, reviewData);
      res.json(review);
    } catch (error: any) {
      console.error("Error updating review:", error);
      res.status(500).json({ message: "Failed to update review" });
    }
  });

  app.patch("/api/reviews/:id", ...adminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const review = await storage.updateReview(id, updateData);
      res.json(review);
    } catch (error: any) {
      console.error("Error patching review:", error);
      res.status(500).json({ message: "Failed to update review" });
    }
  });

  app.delete("/api/reviews/:id", ...adminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteReview(id);
      res.json({ message: "Review deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting review:", error);
      res.status(500).json({ message: "Failed to delete review" });
    }
  });
}
