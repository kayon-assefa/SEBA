import { useEffect } from "react";
import { Bell } from "lucide-react";
import { SettingsCard, SettingsButton } from "../components";

// Bug fix: this used to be a full duplicate notification-settings form living
// inside Settings. Notifications now live on their own page — clicking the
// bell (or this card) takes you straight to /notifications.
export default function NotificationSection() {
  useEffect(() => {
    window.location.href = "/notifications";
  }, []);

  return (
    <div className="space-y-6">
      <SettingsCard title="Notifications" description="Redirecting you to your notifications…">
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <Bell size={28} className="text-gray-400" />
          <p className="text-sm text-gray-500">
            Notifications now live on their own page.
          </p>
          <SettingsButton onClick={() => (window.location.href = "/notifications")}>
            Go to notifications
          </SettingsButton>
        </div>
      </SettingsCard>
    </div>
  );
}
