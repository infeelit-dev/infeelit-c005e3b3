import { useState, useEffect } from "react";

// Returns the saved display name as a string (empty when not set).
// Treat this hook as returning the raw value to keep call-sites simple.
const useUserName = (): string => {
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const saved = localStorage.getItem("infeelit_user_name");
    if (saved) setUserName(saved);
    const onStorage = (e: StorageEvent) => {
      if (e.key === "infeelit_user_name") setUserName(e.newValue || "");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return userName;
};

export default useUserName;
export { useUserName };
