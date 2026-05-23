import { useState, useEffect } from "react";

const useUserName = () => {
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const savedName = localStorage.getItem("infeelit_user_name");
    if (savedName) {
      setUserName(savedName);
    }
  }, []);

  return { userName, setUserName };
};

export default useUserName;
export { useUserName };
