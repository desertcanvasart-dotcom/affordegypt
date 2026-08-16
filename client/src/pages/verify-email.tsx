import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

export default function VerifyEmail() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  // The KEY, not the translated string. Storing the resolved text froze it at
  // whatever language was active when the effect ran: switching language after
  // that left the title and buttons translated and the message stuck in
  // English, because the effect must not re-run — it would re-issue the
  // verification request. Resolving at render keeps the whole card in one
  // language.
  const [messageKey, setMessageKey] = useState('');
  
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessageKey('verifyEmail.noToken');
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);

        if (response.ok) {
          setStatus('success');
          // The endpoint answers in English prose, and this used to render it
          // directly with the client string only as a fallback — so the
          // translated message was the one a reader almost never saw. The
          // outcome is what matters here and `response.ok` already carries it;
          // the wording is the client's to say, in the reader's language.
          setMessageKey('verifyEmail.success');
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            setLocation('/login');
          }, 3000);
        } else {
          setStatus('error');
          setMessageKey('verifyEmail.failed');
        }
      } catch (error) {
        setStatus('error');
        setMessageKey('verifyEmail.error');
      }
    };

    verifyEmail();
  }, [token, setLocation]);

  const handleResend = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        setMessageKey('verifyEmail.resendNoEmail');
        return;
      }

      const response = await apiRequest('POST', '/api/auth/resend-verification', { email: userEmail });

      if (response.ok) {
        setMessageKey('verifyEmail.resendSent');
      } else {
        setMessageKey('verifyEmail.resendFailed');
      }
    } catch (error) {
      setMessageKey('verifyEmail.error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === 'verifying' && (
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="w-16 h-16 text-green-600" />
            )}
            {status === 'error' && (
              <XCircle className="w-16 h-16 text-red-600" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === 'verifying' && t('verifyEmail.titleVerifying')}
            {status === 'success' && t('verifyEmail.titleSuccess')}
            {status === 'error' && t('verifyEmail.titleFailed')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground mb-6">
            {messageKey && t(messageKey)}
          </p>

          {status === 'success' && (
            <p className="text-center text-sm text-muted-foreground">
              {t('verifyEmail.redirecting')}
            </p>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <Button
                onClick={handleResend}
                variant="outline"
                className="w-full"
              >
                <Mail className="w-4 h-4 mr-2" />
                {t('verifyEmail.resendCta')}
              </Button>
              <Button
                onClick={() => setLocation('/login')}
                className="w-full"
              >
                {t('verifyEmail.goToLogin')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
