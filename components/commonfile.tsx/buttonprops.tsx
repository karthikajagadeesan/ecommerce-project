import React from "react";
import CustomButton from "../customButton";

interface CommonConsultationProps {
  buttonText?: string;
  buttonIconColor?: string;
  buttonIconBgColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  onButtonClick?: string | (() => void);
}

const CommonConsultation: React.FC<CommonConsultationProps> = ({
  // ✅ Only button props
  buttonText = "Get Started",
  buttonIconColor = "text-white",
  buttonIconBgColor = "bg-black group-hover:bg-gray-800",
  buttonBgColor = "bg-white",
  buttonTextColor = "text-black",
  onButtonClick = "/signup",
}) => {
  return (
    <section className="py-20 text-center">
      <div className="max-w-4xl mx-auto px-4">
        {buttonText && (
          <CustomButton
            text={buttonText}
            iconColor={buttonIconColor}
            iconBgColor={buttonIconBgColor}
            buttonBgColor={buttonBgColor}
            textColor={buttonTextColor}
            onClick={onButtonClick}
          />
        )}
      </div>
    </section>
  );
};

export default CommonConsultation;