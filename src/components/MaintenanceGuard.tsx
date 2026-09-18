import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSiteSettings } from "../contexts/SiteSettingsContext";
import Maintenance from "../pages/Maintenance";

export default function MaintenanceGuard() {
  const { settings, loading } = useSiteSettings();
  const location = useLocation();

  if (loading) {
    return null;
  }

  /*
   * Nunca bloquear o painel administrativo.
   */
  if (location.pathname.startsWith("/admin")) {
    return <Outlet />;
  }

  if (settings.maintenance_mode) {
    return <Maintenance />;
  }

  return <Outlet />;
}