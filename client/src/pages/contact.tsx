import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, Users, Award, Shield } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import SeoMeta from "@/components/seo-meta";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { OPERATOR } from "@shared/operator-facts";

// A factory, not a module constant: the validation messages are translated, so
// the schema must be built after i18next is available and rebuilt when the
// visitor switches language.
const makeContactSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(2, t("contactPage.vName")),
    email: z.string().email(t("contactPage.vEmail")),
    phone: z.string().optional(),
    subject: z.string().min(5, t("contactPage.vSubject")),
    message: z.string().min(10, t("contactPage.vMessage")),
  });

type ContactFormData = z.infer<ReturnType<typeof makeContactSchema>>;

export default function Contact() {
  const { t, i18n } = useTranslation();
  const contactSchema = useMemo(() => makeContactSchema(t), [t, i18n.language]);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      return await apiRequest("POST", "/api/contact", data);
    },
    onSuccess: () => {
      toast({
        title: t("contactPage.okTitle"),
        description: t("contactPage.okBody"),
      });
      form.reset();
      setIsSubmitting(false);
    },
    onError: (error: any) => {
      toast({
        title: t("contactPage.errTitle"),
        description: error.message || t("contactPage.errBody"),
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    contactMutation.mutate(data);
  };

  return (
    <>
      <SeoMeta
        title={t("contactPage.seoTitle")}
        description={t("contactPage.seoDescription")}
        canonical="https://affordegypt.com/contact"
      />
      
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background py-20">
        <div className="absolute inset-0 opacity-30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-foreground mb-6 leading-tight">
              {t("contactPage.heroTitle")}
              <span className="text-primary block">{t("contactPage.heroTitleAccent")}</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              {t("contactPage.heroSubtitle")}
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2 bg-background/80 px-4 py-2 rounded-full shadow-sm">
                <MessageCircle className="w-4 h-4 text-primary" />
                <span>{t("contactPage.badgeInstant")}</span>
              </div>
              <div className="flex items-center gap-2 bg-background/80 px-4 py-2 rounded-full shadow-sm">
                <Users className="w-4 h-4 text-primary" />
                <span>{t("contactPage.badgeExperts")}</span>
              </div>
              <div className="flex items-center gap-2 bg-background/80 px-4 py-2 rounded-full shadow-sm">
                <Award className="w-4 h-4 text-primary" />
                <span>{t("contactPage.badgePrices")}</span>
              </div>
              <div className="flex items-center gap-2 bg-background/80 px-4 py-2 rounded-full shadow-sm">
                <Shield className="w-4 h-4 text-primary" />
                <span>{t("contactPage.badgeSecure")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-6">
                {t("contactPage.getInTouch")}
              </h2>
              <p className="text-muted-foreground mb-8">
                {t("contactPage.getInTouchBody")}
              </p>
            </div>

            {/* Contact Details */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{t("contactPage.email")}</h3>
                      <p className="text-muted-foreground">hello@affordegypt.com</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t("contactPage.emailNote")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{t("contactPage.phone")}</h3>
                      <p className="text-muted-foreground">+20 110 076 5283</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t("contactPage.phoneNote")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{t("contactPage.office")}</h3>
                      <p className="text-muted-foreground">
                        {t("contactPage.officeStreet", { street: OPERATOR.address.street })}<br />
                        {t("contactPage.officeLocality", {
                          locality: OPERATOR.address.locality,
                          region: OPERATOR.address.region,
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{t("contactPage.businessHours")}</h3>
                      <p className="text-muted-foreground">
                        {t("contactPage.hoursWeekdays")}<br />
                        {t("contactPage.hoursWeekend")}<br />
                        <span className="text-sm">{t("contactPage.hoursTimezone")}</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{t("contactPage.formTitle")}</CardTitle>
                <p className="text-muted-foreground">
                  {t("contactPage.formSubtitle")}
                </p>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("contactPage.labelName")}</FormLabel>
                            <FormControl>
                              {/* The asterisk is decoration; `required` is what the
                                  browser and assistive tech actually act on. Zod
                                  still validates — this is belt and braces. */}
                              <Input
                                placeholder={t("contactPage.phName")}
                                required
                                autoComplete="name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("contactPage.labelEmail")}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t("contactPage.phEmail")}
                                type="email"
                                required
                                autoComplete="email"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("contactPage.labelPhone")}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t("contactPage.phPhone")}
                              type="tel"
                              autoComplete="tel"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("contactPage.labelSubject")}</FormLabel>
                          <FormControl>
                            <Input placeholder={t("contactPage.phSubject")} required {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("contactPage.labelMessage")}</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t("contactPage.phMessage")}
                              className="min-h-[120px]"
                              required
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full btn-primary"
                      disabled={isSubmitting || contactMutation.isPending}
                    >
                      {isSubmitting || contactMutation.isPending ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                          <span>{t("contactPage.sending")}</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Send className="w-4 h-4" />
                          <span>{t("contactPage.sendMessage")}</span>
                        </div>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-xl">{t("contactPage.faqTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">{t("contactPage.faqQ1")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t("contactPage.faqA1")}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">{t("contactPage.faqQ2")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t("contactPage.faqA2")}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">{t("contactPage.faqQ3")}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t("contactPage.faqA3")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">{t("contactPage.findUs")}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("contactPage.findUsBody")}
            </p>
          </div>
          
          <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
            <div className="aspect-[16/9] w-full">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d220834.96206943142!2d31.041818!3d30.033333!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14583fa60b21beeb%3A0x79dfb296e8423bba!2sCairo%2C%20Cairo%20Governorate%2C%20Egypt!5e0!3m2!1sen!2sus!4v1642021729542!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
                title={t("contactPage.mapTitle")}
              ></iframe>
            </div>
            
            <div className="p-6 bg-card">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold text-foreground mb-1">{t("contactPage.ourLocation")}</h3>
                  <p className="text-sm text-muted-foreground">{t("contactPage.ourLocationValue", { address: OPERATOR.address.full })}</p>
                </div>
                <div className="text-center">
                  <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold text-foreground mb-1">{t("contactPage.officeHours")}</h3>
                  <p className="text-sm text-muted-foreground">{t("contactPage.officeHoursValue")}</p>
                </div>
                <div className="text-center">
                  <Phone className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold text-foreground mb-1">{t("contactPage.contactLabel")}</h3>
                  <p className="text-sm text-muted-foreground">+20 110 076 5283</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </>
  );
}