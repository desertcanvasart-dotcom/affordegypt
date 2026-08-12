import { MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export default function WhatsAppWidget() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  
  // WhatsApp business number - you'll need to replace this with your actual number
  const whatsappNumber = "+201100765283"; // Replace with your WhatsApp Business number
  
  const openWhatsApp = (message: string) => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    setIsOpen(false);
  };

  // The prefilled text opens in the visitor's own language: they are about to
  // continue the conversation in it either way, so an English opener would only
  // mislead about which languages we answer in.
  const quickMessages = [
    { title: t("whatsappWidget.generalInquiry"), message: t("whatsappWidget.msgGeneral") },
    { title: t("whatsappWidget.getQuote"), message: t("whatsappWidget.msgQuote") },
    { title: t("whatsappWidget.bookingSupport"), message: t("whatsappWidget.msgBooking") },
    { title: t("whatsappWidget.customTrip"), message: t("whatsappWidget.msgCustom") },
  ];

  return (
    <>
      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 max-w-[calc(100vw-2rem)]">
          <Card className="shadow-2xl border-0">
            <CardHeader className="bg-[#25D366] text-white p-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Afford Egypt</h3> {/* i18n-exempt: brand name */}
                    <p className="text-xs text-white/80">{t("whatsappWidget.replyTime")}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 p-1 h-auto"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-4">
                {t("whatsappWidget.intro")}
              </p>
              
              <div className="space-y-2">
                {quickMessages.map((msg, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => openWhatsApp(msg.message)}
                    className="w-full text-left justify-start h-auto p-3 text-wrap"
                  >
                    <div>
                      <div className="font-medium text-xs">{msg.title}</div>
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {msg.message.substring(0, 50)}...
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
              
              <div className="mt-4 pt-3 border-t">
                <Button
                  onClick={() => openWhatsApp(t("whatsappWidget.msgDefault"))}
                  className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white"
                  size="sm"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {t('whatsappWidget.startChat')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20BA5A] text-white shadow-2xl transition-all duration-300 hover:scale-110"
          size="icon"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <MessageCircle className="w-6 h-6" />
          )}
        </Button>
        
        {/* Online indicator */}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white">
          <div className="w-full h-full bg-green-500 rounded-full animate-ping"></div>
        </div>
      </div>
    </>
  );
}