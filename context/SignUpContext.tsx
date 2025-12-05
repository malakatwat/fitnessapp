import React, { createContext, PropsWithChildren, useContext, useState } from 'react';

// Define the shape of the data we'll collect
interface SignUpData {
  email?: string;
  goal?: 'lose_weight' | 'maintain_weight' | 'gain_weight';
  age?: string;
  currentWeight?: string;
  targetWeight?: string;
}

// Define the shape of the context value
interface SignUpContextType {
  data: SignUpData;
  updateData: (newData: Partial<SignUpData>) => void;
}

// Create the context
const SignUpContext = createContext<SignUpContextType | undefined>(undefined);

// Create the provider component
export const SignUpProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const [data, setData] = useState<SignUpData>({});

  const updateData = (newData: Partial<SignUpData>) => {
    setData(prevData => ({ ...prevData, ...newData }));
  };

  return (
    <SignUpContext.Provider value={{ data, updateData }}>
      {children}
    </SignUpContext.Provider>
  );
};

// Create a custom hook for easy access to the context
export const useSignUp = () => {
  const context = useContext(SignUpContext);
  if (!context) {
    throw new Error('useSignUp must be used within a SignUpProvider');
  }
  return context;
};
