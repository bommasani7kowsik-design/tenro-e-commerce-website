import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useAuthorizeAdmin, useSaveCallerUserProfile, useGetCallerUserProfile } from '../hooks/useQueries';
import { Shield, AlertCircle, CheckCircle2, Loader2, Smartphone, Lock } from 'lucide-react';
import { toast } from 'sonner';

const KOWSIK_MOBILE = '7569114467';
const ADMIN_OTP = '1234';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const authorizeAdmin = useAuthorizeAdmin();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'mobile' | 'otp' | 'verifying' | 'success'>('mobile');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  // Auto-fill mobile number if user already has a profile
  useEffect(() => {
    if (userProfile?.mobileNumber && !mobileNumber) {
      setMobileNumber(userProfile.mobileNumber);
    }
  }, [userProfile, mobileNumber]);

  const handleMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!mobileNumber.trim()) {
      setErrorMessage('Please enter your mobile number');
      return;
    }

    if (!/^\d{10}$/.test(mobileNumber.trim())) {
      setErrorMessage('Please enter a valid 10-digit mobile number');
      return;
    }

    // Only Kowsik's mobile number is allowed
    if (mobileNumber !== KOWSIK_MOBILE) {
      setErrorMessage(`Access restricted. This admin portal is exclusively for authorized personnel.`);
      return;
    }

    // First authenticate with Internet Identity if not already authenticated
    if (!isAuthenticated) {
      try {
        await login();
        // After login, we'll proceed to OTP step
        setStep('otp');
      } catch (error: any) {
        console.error('Authentication error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        } else {
          setErrorMessage('Authentication failed. Please try again.');
        }
      }
    } else {
      setStep('otp');
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!otp.trim()) {
      setErrorMessage('Please enter the OTP');
      return;
    }

    if (otp !== ADMIN_OTP) {
      setErrorMessage(`Invalid OTP. Please enter the correct verification code.`);
      return;
    }

    setStep('verifying');

    try {
      // Ensure user has a profile with the correct mobile number
      if (!userProfile || userProfile.mobileNumber !== KOWSIK_MOBILE) {
        await saveProfile.mutateAsync({
          name: userProfile?.name || 'Bommasani Kowsik',
          email: userProfile?.email || `admin@tenro.com`,
          address: userProfile?.address,
          mobileNumber: KOWSIK_MOBILE,
        });
        // Wait for the profile to be saved and admin status to be updated
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // Call backend authorizeAdmin function
      const status = await authorizeAdmin.mutateAsync({
        loginId: KOWSIK_MOBILE,
        otp: ADMIN_OTP,
      });

      // Handle different status responses
      if (status === 'success') {
        setStep('success');
        toast.success('Admin access granted! Redirecting to dashboard...');
        // Wait for admin status to be fully updated
        await new Promise(resolve => setTimeout(resolve, 1200));
        navigate({ to: '/admin' });
      } else if (status === 'invalidOtp') {
        setErrorMessage(`Invalid OTP. Please enter the correct verification code.`);
        setStep('otp');
      } else if (status === 'invalidMobile') {
        setErrorMessage(`Access restricted. This admin portal is exclusively for authorized personnel.`);
        setStep('mobile');
      } else if (status === 'invalidSession') {
        setErrorMessage('Session invalid. Please ensure you are logged in with the correct account.');
        setStep('mobile');
      } else if (status === 'unauthorized') {
        setErrorMessage(`Authentication failed. Please ensure you are logged in with the authorized account.`);
        setStep('mobile');
      } else {
        setErrorMessage('Authorization failed. Please try again.');
        setStep('mobile');
      }
    } catch (error: any) {
      console.error('Admin authorization error:', error);
      setErrorMessage(error.message || 'Failed to authorize admin access. Please try again.');
      setStep('mobile');
    }
  };

  const handleReset = async () => {
    if (isAuthenticated) {
      await clear();
    }
    setMobileNumber('');
    setOtp('');
    setStep('mobile');
    setErrorMessage('');
  };

  return (
    <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <div className="w-full max-w-lg">
        <Card className="border-2 shadow-lg">
          <CardHeader className="space-y-4 text-center pb-8">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 ring-4 ring-primary/10">
              <Shield className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold tracking-tight">Admin Portal</CardTitle>
              <CardDescription className="text-base">
                Secure access for authorized administrators
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-8">
            {step === 'mobile' && (
              <>
                {errorMessage && (
                  <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="font-medium">{errorMessage}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleMobileSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="mobile" className="text-base font-semibold">
                      Mobile Number
                    </Label>
                    <div className="relative">
                      <Smartphone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="mobile"
                        type="tel"
                        placeholder="Enter your 10-digit mobile number"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="h-12 pl-12 text-base"
                        required
                        disabled={isLoggingIn}
                        autoFocus
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Enter the mobile number associated with your admin account
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="h-12 w-full text-base font-semibold"
                    size="lg"
                    disabled={isLoggingIn || !mobileNumber || mobileNumber.length !== 10}
                  >
                    {isLoggingIn ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      <>
                        Continue
                      </>
                    )}
                  </Button>
                </form>

                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Note:</strong> This portal is exclusively for authorized administrators. 
                    First-time access will automatically establish admin privileges for the authorized mobile number.
                  </p>
                </div>
              </>
            )}

            {step === 'otp' && (
              <>
                {errorMessage && (
                  <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="font-medium">{errorMessage}</AlertDescription>
                  </Alert>
                )}

                <div className="rounded-lg border bg-primary/5 p-4">
                  <div className="flex items-start gap-3">
                    <Lock className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">Verification Required</p>
                      <p className="text-sm text-muted-foreground">
                        Enter the OTP sent to your registered mobile number ending in <strong>**{mobileNumber.slice(-4)}</strong>
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Demo OTP: <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">{ADMIN_OTP}</code>
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="otp" className="text-base font-semibold">
                      One-Time Password
                    </Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 4-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      maxLength={4}
                      className="h-12 text-center text-2xl font-semibold tracking-widest"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleReset}
                      className="h-12 flex-1 text-base font-semibold"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="h-12 flex-1 text-base font-semibold"
                      disabled={authorizeAdmin.isPending || saveProfile.isPending || !otp || otp.length !== 4}
                    >
                      {(authorizeAdmin.isPending || saveProfile.isPending) ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        'Verify & Login'
                      )}
                    </Button>
                  </div>
                </form>
              </>
            )}

            {step === 'verifying' && (
              <Alert className="border-primary/50 bg-primary/5">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <AlertDescription className="font-medium">
                  Verifying admin credentials and establishing secure session...
                </AlertDescription>
              </Alert>
            )}

            {step === 'success' && (
              <Alert className="border-green-500/50 bg-green-50 text-green-900 dark:border-green-500/30 dark:bg-green-950 dark:text-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <AlertDescription className="font-semibold">
                  Admin access granted! Redirecting to dashboard...
                </AlertDescription>
              </Alert>
            )}

            <div className="border-t pt-6 text-center">
              <Button
                variant="ghost"
                onClick={() => navigate({ to: '/' })}
                className="text-muted-foreground hover:text-foreground"
              >
                ← Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Secured by Internet Identity • Tenro Admin Portal
          </p>
        </div>
      </div>
    </div>
  );
}
