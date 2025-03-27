
import React, { createContext, useContext, useState, ReactNode } from "react";

type CapsuleCreationContextType = {
  capsuleName: string;
  setCapsuleName: (name: string) => void;
  message: string;
  setMessage: (message: string) => void;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  selectedImage: File | null;
  setSelectedImage: (file: File | null) => void;
  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;
  auctionEnabled: boolean;
  setAuctionEnabled: (enabled: boolean) => void;
  paymentMethod: number;
  setPaymentMethod: (method: number) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  resetForm: () => void;
};

const CapsuleCreationContext = createContext<CapsuleCreationContextType | undefined>(undefined);

export const CapsuleCreationProvider = ({ children }: { children: ReactNode }) => {
  const [capsuleName, setCapsuleName] = useState("");
  const [message, setMessage] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [auctionEnabled, setAuctionEnabled] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(0); // 0 = BNB, 1 = ETH
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setCapsuleName("");
    setMessage("");
    setSelectedDate(undefined);
    setSelectedImage(null);
    setPreviewUrl(null);
    setAuctionEnabled(false);
    setPaymentMethod(0);
  };

  return (
    <CapsuleCreationContext.Provider
      value={{
        capsuleName,
        setCapsuleName,
        message,
        setMessage,
        selectedDate,
        setSelectedDate,
        selectedImage,
        setSelectedImage,
        previewUrl,
        setPreviewUrl,
        auctionEnabled,
        setAuctionEnabled,
        paymentMethod,
        setPaymentMethod,
        isLoading,
        setIsLoading,
        resetForm,
      }}
    >
      {children}
    </CapsuleCreationContext.Provider>
  );
};

export const useCapsuleCreation = () => {
  const context = useContext(CapsuleCreationContext);
  if (!context) {
    throw new Error("useCapsuleCreation must be used within a CapsuleCreationProvider");
  }
  return context;
};
