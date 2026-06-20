import { useEffect, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

export default function VerifyEmail() {
  const [, params] = useRoute('/verify-email');
  const [location, setLocation] = useLocation();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');
  
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. Please check your email for the correct link.');
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully!');
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            setLocation('/login');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed. Please try again.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred during verification. Please try again.');
      }
    };

    verifyEmail();
  }, [token, setLocation]);

  const handleResend = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        setMessage('Unable to resend. Please register again.');
        return;
      }

      const response = await apiRequest('POST', '/api/auth/resend-verification', { email: userEmail });

      if (response.ok) {
        setMessage('Verification email resent! Please check your inbox.');
      } else {
        setMessage('Failed to resend email. Please try again later.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
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
            {status === 'verifying' && 'Verifying Your Email'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground mb-6">
            {message}
          </p>

          {status === 'success' && (
            <p className="text-center text-sm text-muted-foreground">
              Redirecting to login page...
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
                Resend Verification Email
              </Button>
              <Button
                onClick={() => setLocation('/login')}
                className="w-full"
              >
                Go to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
