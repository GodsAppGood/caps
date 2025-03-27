
import React from "react";
import { useCapsuleCreation } from "@/contexts/CapsuleCreationContext";
import CapsuleNameInput from "./CapsuleNameInput";
import CapsuleMessageInput from "./CapsuleMessageInput";
import CapsuleImageUpload from "./CapsuleImageUpload";
import CapsuleDatePicker from "./CapsuleDatePicker";
import CapsulePaymentMethod from "./CapsulePaymentMethod";
import CapsuleAuctionToggle from "./CapsuleAuctionToggle";

const CapsuleCreationForm = () => {
  const {
    capsuleName,
    setCapsuleName,
    message,
    setMessage,
    selectedDate,
    setSelectedDate,
    previewUrl,
    setSelectedImage,
    setPreviewUrl,
    auctionEnabled,
    setAuctionEnabled,
    paymentMethod,
    setPaymentMethod,
  } = useCapsuleCreation();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
  };

  return (
    <div className="space-y-6 py-4">
      <CapsuleNameInput capsuleName={capsuleName} setCapsuleName={setCapsuleName} />
      <CapsuleMessageInput message={message} setMessage={setMessage} />
      <CapsuleImageUpload 
        previewUrl={previewUrl} 
        handleImageUpload={handleImageUpload} 
        resetImage={resetImage}
      />
      <CapsuleDatePicker selectedDate={selectedDate} setSelectedDate={setSelectedDate} />

      <div className="space-y-4 pt-4 border-t border-neon-blue/20">
        <CapsulePaymentMethod paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />
        <CapsuleAuctionToggle auctionEnabled={auctionEnabled} setAuctionEnabled={setAuctionEnabled} />
      </div>
    </div>
  );
};

export default CapsuleCreationForm;
