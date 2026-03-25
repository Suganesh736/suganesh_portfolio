import { createContext, useContext, useState, useCallback, ReactNode } from "react";

const ADMIN_PASSWORD = "4646";

interface AdminContextType {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  requestAuth: (onSuccess: () => void) => void;
  showPasswordDialog: boolean;
  setShowPasswordDialog: (v: boolean) => void;
  showChangePassword: boolean;
  setShowChangePassword: (v: boolean) => void;
  pendingAction: (() => void) | null;
  changePassword: (oldPw: string, newPw: string) => boolean;
  currentPassword: string;
}

const AdminContext = createContext<AdminContextType | null>(null);

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be inside AdminProvider");
  return ctx;
};

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [currentPassword, setCurrentPassword] = useState(ADMIN_PASSWORD);

  const login = useCallback((password: string) => {
    if (password === currentPassword) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, [currentPassword]);

  const logout = useCallback(() => setIsAuthenticated(false), []);

  const requestAuth = useCallback((onSuccess: () => void) => {
    if (isAuthenticated) {
      onSuccess();
    } else {
      setPendingAction(() => onSuccess);
      setShowPasswordDialog(true);
    }
  }, [isAuthenticated]);

  const changePassword = useCallback((oldPw: string, newPw: string) => {
    if (oldPw === currentPassword) {
      setCurrentPassword(newPw);
      return true;
    }
    return false;
  }, [currentPassword]);

  return (
    <AdminContext.Provider value={{
      isAuthenticated, login, logout, requestAuth,
      showPasswordDialog, setShowPasswordDialog,
      showChangePassword, setShowChangePassword,
      pendingAction, changePassword, currentPassword
    }}>
      {children}
    </AdminContext.Provider>
  );
};
