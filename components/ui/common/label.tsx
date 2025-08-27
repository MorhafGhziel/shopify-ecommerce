import clsx from "clsx";
import { Price } from "./price";

export function Label({
  title,
  amount,
  currencyCode,
  position = "bottom",
}: {
  title: string;
  amount: string;
  currencyCode: string;
  position?: "bottom" | "center";
}) {
  return (
    <div
      className={clsx(
        "absolute bottom-0 left-0 flex justify-center w-full px-4 pb-4 @container/label",
        {
          "lg:px-20 lg:pb-[35%]": position === "center",
        }
      )}
    >
      <div className="relative group">
        <div className="absolute inset-0 bg-black/30 rounded-2xl blur-lg transform group-hover:scale-105 transition-all duration-300"></div>
        <div
          className={clsx(
            "relative inline-flex items-center rounded-2xl bg-gradient-to-r from-black/80 to-neutral-900/80 backdrop-blur-md shadow-2xl border border-white/10",
            {
              "justify-between w-full": position === "center",
              "gap-2": position === "bottom",
            }
          )}
        >
          <h3 className="px-4 py-3 line-clamp-1 text-sm font-medium text-white/90">
            {title}
          </h3>
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
            <Price
              className="relative flex items-center px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-neutral-800 to-neutral-700 rounded-r-2xl"
              amount={amount}
              currencyCode={currencyCode}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
