import { BrandLogo } from "@/components/shared/BrandLogo";

export function AppLoader() {
  return (
    <div className="grid min-h-[60vh] place-items-center px-4">
      <div className="flex flex-col items-center gap-5 rounded-3xl border border-border-soft bg-white px-10 py-8 shadow-[0_24px_70px_rgba(32,33,39,0.08)]">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-2xl bg-primary/20" />
          <BrandLogo href="/" />
        </div>
        <div className="h-1.5 w-36 overflow-hidden rounded-full bg-primary-soft">
          <div className="h-full w-1/2 animate-[pulse_1.1s_ease-in-out_infinite] rounded-full bg-primary" />
        </div>
      </div>
    </div>
  );
}
