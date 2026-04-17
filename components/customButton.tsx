import React from "react";
import { HiOutlineArrowRight } from "react-icons/hi2";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface CustomButtonProps {
  text: string;
  onClick?: string | (() => void);
  iconColor: string;
  iconBgColor: string;
  buttonBgColor: string;
  textColor: string;
  borderColor?: string;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
}

const CustomButton: React.FC<CustomButtonProps> = ({
  text,
  onClick,
  iconColor,
  iconBgColor,
  buttonBgColor,
  textColor,
  borderColor,
  disabled,
  loading,
  type = "button",
}) => {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    if (typeof onClick === "function") {
      onClick();
    } else if (typeof onClick === "string") {
      router.push(onClick);
    }
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      className={`relative inline-flex items-center ${buttonBgColor} flex ${borderColor || ''} ${textColor} text-sm sm:text-base font-medium rounded-full shadow-lg transition-all duration-300 transform ${(!disabled && !loading) ? "group hover:shadow-xl cursor-pointer" : disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} pl-1.5 pr-4 sm:pr-6 py-2 sm:py-2 overflow-hidden`}
    >
      <div
        className={`absolute transition-all duration-700 ease-out ${iconBgColor} rounded-full w-6 h-6 sm:w-9 sm:h-9 flex items-center justify-center z-10 ${
          loading
            ? "left-[calc(100%-1.5rem)] sm:left-[calc(100%-2.5rem)]"
            : disabled
            ? "left-1"
            : "left-1 group-hover:left-[calc(100%-1.5rem)] sm:group-hover:left-[calc(100%-2.5rem)]"
        }`}
      >
        <HiOutlineArrowRight className={`${iconColor} w-3 h-3 sm:w-4 sm:h-4`} />
      </div>

      <span className={`py-1 whitespace-nowrap transition-all duration-700 ease-out ${
        loading
          ? "ml-2 mr-4 sm:mr-5"
          : disabled
          ? "ml-8 sm:ml-10"
          : "ml-8 sm:ml-10 group-hover:ml-2 group-hover:mr-4 sm:group-hover:mr-5"
      }`}>
        {text}
      </span>
    </button>
  );
};

export default CustomButton;
