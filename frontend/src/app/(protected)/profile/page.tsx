"use client";

import * as React from "react";
import { Shield } from "lucide-react";
import { Navbar } from "@/components/common/Navbar";
import { MedicalDisclaimer } from "@/components/common/MedicalDisclaimer";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileVitalsForm } from "@/components/profile/ProfileVitalsForm";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { useAuth } from "@/hooks/useAuth";
import { usersApi } from "@/lib/api/users";

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const [profileData, setProfileData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  const fetchProfile = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await usersApi.getProfile();
      setProfileData(data);
    } catch (err) {
      console.warn("Lỗi tải hồ sơ:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <MedicalDisclaimer variant="banner" />
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Hồ sơ Cá nhân &amp; Nhân trắc học
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Quản lý thông tin tài khoản và chỉ số thể trạng phục vụ đánh giá nguy cơ AI
          </p>
        </div>

        <ProfileHeader user={user} />

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ProfileVitalsForm
                initialData={profileData}
                onSuccess={() => {
                  fetchProfile();
                  refreshProfile();
                }}
              />
            </div>
            <div className="space-y-6">
              <ChangePasswordForm />
              <div className="p-4 rounded-xl bg-medical-50/60 dark:bg-medical-950/40 border border-medical-200 dark:border-medical-800 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-medical-800 dark:text-medical-300">
                  <Shield className="w-4 h-4 text-medical-600" />
                  Quy định Bảo vệ Dữ liệu Y tế
                </div>
                <p className="leading-relaxed">
                  Thông tin sức khỏe được bảo vệ nghiêm ngặt theo tiêu chuẩn bảo mật dữ liệu y tế và mã hóa an toàn.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
