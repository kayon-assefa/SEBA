import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../../auth/context/AuthContext";
import { authService } from "../../auth/services/auth.service";

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await authService.signOut();

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>Dashboard</h1>

      <p>Welcome, {user?.email}</p>

      <button onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default Dashboard;