import { RegisterForm } from "@/components/auth/RegisterForm";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-page-bg px-4 py-10">
      <div className="absolute left-1/2 top-0 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-primary-soft blur-3xl" />
      <Card className="relative w-full max-w-md">
        <CardHeader className="gap-4 text-center">
          <BrandLogo className="mx-auto justify-center" />
          <div>
            <CardTitle className="text-2xl font-semibold">Create your account</CardTitle>
            <CardDescription>Start or join transparent contribution groups in minutes.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </main>
  );
}
