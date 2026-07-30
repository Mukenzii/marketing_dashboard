import { uz } from "@/lib/i18n/uz";

const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <div className="flex size-9 flex-none items-center justify-center rounded-full bg-foreground text-background text-sm font-bold">
        F
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-[15px] font-bold tracking-tight text-foreground">
          {uz.brand}
          <span className="text-blue-500">.</span>
        </span>
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {uz.brandSuffix}
        </span>
      </div>
    </div>
  );
};

export default Logo;
