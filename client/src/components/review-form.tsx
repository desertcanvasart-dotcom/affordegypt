import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// A factory, not a module constant: the validation messages are translated, so
// the schema must be built after i18next is available and rebuilt when the
// visitor switches language. Same pattern as contact.tsx and book.tsx.
const makeReviewFormSchema = (t: (key: string) => string) =>
  z.object({
    customerName: z.string().min(2, t("validation.nameMin")),
    customerLocation: z.string().optional(),
    rating: z.number().min(1).max(5),
    title: z.string().min(5, t("validation.titleMin")),
    content: z.string().min(20, t("validation.reviewMin")),
    tripDate: z.string().optional(),
  });

type ReviewFormData = z.infer<ReturnType<typeof makeReviewFormSchema>>;

interface ReviewFormProps {
  onSuccess?: () => void;
}

export default function ReviewForm({ onSuccess }: ReviewFormProps) {
  const { t, i18n } = useTranslation();
  const reviewFormSchema = useMemo(() => makeReviewFormSchema(t), [t, i18n.language]);

  // The label is what a screen reader announces for each star, so it is
  // content, not decoration — it comes from the locale file like everything
  // else. The value stays derived from position.
  const ratingOptions = useMemo(() => {
    const labels = t("submitReviewPage.form.ratingLabels", { returnObjects: true }) as string[];
    return labels.map((label, i) => ({ value: i + 1, label }));
  }, [t, i18n.language]);

  const [hoveredRating, setHoveredRating] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      customerName: "",
      customerLocation: "",
      rating: 5,
      title: "",
      content: "",
      tripDate: "",
    },
  });

  const createReviewMutation = useMutation({
    mutationFn: (data: ReviewFormData) => {
      const reviewData = {
        ...data,
        tripDate: data.tripDate ? new Date(data.tripDate) : null,
        isVerified: false,
        isActive: true,
      };
      return apiRequest("POST", "/api/reviews", reviewData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reviews"] });
      form.reset();
      toast({
        title: t("submitReviewPage.form.successTitle"),
        description: t("submitReviewPage.form.successBody"),
      });
      onSuccess?.();
    },
    onError: () => {
      // error.message is a server string, untranslated and often just a status.
      toast({
        title: t("submitReviewPage.form.errorTitle"),
        description: t("submitReviewPage.form.errorBody"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ReviewFormData) => {
    createReviewMutation.mutate(data);
  };

  /**
   * The stars used to be bare SVGs with an onClick — unreachable by keyboard,
   * and a screen reader heard only the "5/5 stars" summary with no way to
   * change it. Native radios in a fieldset give arrow-key selection, the
   * "Rating, 4 stars — very good, radio button 4 of 5" announcement and the
   * required state for free; the SVG is decorative on top of them.
   */
  const renderStars = (rating: number) => (
    <fieldset
      className="m-0 border-0 p-0"
      onMouseLeave={() => setHoveredRating(0)}
    >
      {/* The legend is the group's visible label. A <FormLabel> here would
          render `for="…-form-item"` pointing at a control that no longer
          exists, which is worse than no label at all. */}
      <legend className="text-sm font-medium leading-none mb-2">{t("submitReviewPage.form.ratingLabel")}</legend>
      <div className="flex items-center gap-1">
        {ratingOptions.map(({ value, label }) => (
          <label
            key={value}
            className="cursor-pointer rounded p-0.5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-offset-1"
            onMouseEnter={() => setHoveredRating(value)}
          >
            <input
              type="radio"
              name="rating"
              value={value}
              required
              checked={rating === value}
              onChange={() => form.setValue("rating", value, { shouldValidate: true })}
              className="sr-only"
            />
            <span className="sr-only">{label}</span>
            <Star
              aria-hidden="true"
              className={`w-6 h-6 transition-colors ${
                value <= (hoveredRating || rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </label>
        ))}
        <span className="ml-2 text-sm text-gray-600" aria-hidden="true">
          {t("submitReviewPage.form.ratingSummary", { rating })}
        </span>
      </div>
    </fieldset>
  );

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">{t("submitReviewPage.form.title")}</CardTitle>
        <p className="text-center text-gray-600">
          {t("submitReviewPage.form.subtitle")}
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          {/* noValidate keeps the `required` attributes as semantics for
              assistive tech without letting the browser's bubble preempt the
              zod messages, which say more ("at least 20 characters"). */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("submitReviewPage.form.name")}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t("submitReviewPage.form.namePlaceholder")} required autoComplete="name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customerLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("submitReviewPage.form.location")}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t("submitReviewPage.form.locationPlaceholder")} autoComplete="address-level2" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tripDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("submitReviewPage.form.tripDate")}</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  {renderStars(field.value)}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("submitReviewPage.form.reviewTitle")}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t("submitReviewPage.form.reviewTitlePlaceholder")} required autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("submitReviewPage.form.review")}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={t("submitReviewPage.form.reviewPlaceholder")}
                      required
                      rows={5}
                      className="resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full bg-teal-600 hover:bg-teal-700"
              disabled={createReviewMutation.isPending}
            >
              {createReviewMutation.isPending ? (
                <>
                  <div className="w-4 h-4 animate-spin border-2 border-current border-t-transparent rounded-full mr-2"></div>
                  {t("submitReviewPage.form.submitting")}
                </>
              ) : (
                t("submitReviewPage.form.submit")
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}