import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { User } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { FullPageLoader } from "~/components/FullPageLoader";
import { Header } from "~/components/Header";
import { PageContainer } from "~/components/PageContainer";
import {
	ProfileInformation,
	PasswordChange,
	PreferencesDisplay,
	DangerZone,
	DeleteAccountModal,
} from "~/components/profile";
import type { UserRole } from "~/lib/db/types";
import { api, ApiError } from "~/lib/api/client";

export const Route = createFileRoute("/profile")({
	component: ProfilePage,
});

interface UserProfile {
	name: string;
	email: string;
	role: UserRole;
	createdAt: string;
	preferences: any;
}

function ProfilePage() {
	const navigate = useNavigate();
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(true);

	// Profile update state
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [profileError, setProfileError] = useState("");
	const [profileSuccess, setProfileSuccess] = useState("");
	const [profileUpdating, setProfileUpdating] = useState(false);

	// Password change state
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [passwordError, setPasswordError] = useState("");
	const [passwordSuccess, setPasswordSuccess] = useState("");
	const [passwordUpdating, setPasswordUpdating] = useState(false);

	// Delete account state
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deleteConfirmPassword, setDeleteConfirmPassword] = useState("");
	const [deleteError, setDeleteError] = useState("");
	const [deleting, setDeleting] = useState(false);

	const fetchProfile = useCallback(async () => {
		try {
			const data = await api.get<UserProfile>("/api/profile");
			setProfile(data);
			setName(data.name || "");
			setEmail(data.email || "");
		} catch (error) {
			if (error instanceof ApiError && error.status === 401) {
				navigate({ to: "/auth/login" });
				return;
			}
			console.error("Error fetching profile:", error);
		} finally {
			setLoading(false);
		}
	}, [navigate]);

	useEffect(() => {
		fetchProfile();
	}, [fetchProfile]);

	const handleUpdateProfile = async (e: React.FormEvent) => {
		e.preventDefault();
		setProfileError("");
		setProfileSuccess("");
		setProfileUpdating(true);

		try {
			const data = await api.patch<{ name: string; email: string }>(
				"/api/profile",
				{ name, email },
			);
			setProfileSuccess("Profile updated successfully!");
			setProfile({ ...profile!, name: data.name, email: data.email });
			setTimeout(() => setProfileSuccess(""), 3000);
		} catch (error) {
			if (error instanceof ApiError) {
				setProfileError(error.message || "Failed to update profile");
			} else {
				setProfileError("An unexpected error occurred");
			}
		} finally {
			setProfileUpdating(false);
		}
	};

	const handleChangePassword = async (e: React.FormEvent) => {
		e.preventDefault();
		setPasswordError("");
		setPasswordSuccess("");

		if (newPassword !== confirmPassword) {
			setPasswordError("Passwords do not match");
			return;
		}

		if (newPassword.length < 8) {
			setPasswordError("Password must be at least 8 characters");
			return;
		}

		setPasswordUpdating(true);

		try {
			await api.post("/api/profile/password", {
				currentPassword,
				newPassword,
			});
			setPasswordSuccess("Password changed successfully!");
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
			setTimeout(() => setPasswordSuccess(""), 3000);
		} catch (error) {
			if (error instanceof ApiError) {
				setPasswordError(error.message || "Failed to change password");
			} else {
				setPasswordError("An unexpected error occurred");
			}
		} finally {
			setPasswordUpdating(false);
		}
	};

	const handleDeleteAccount = async () => {
		setDeleteError("");
		setDeleting(true);

		try {
			await api.delete("/api/profile", { password: deleteConfirmPassword });
			// Account deleted, redirect to home
			window.location.href = "/";
		} catch (error) {
			if (error instanceof ApiError) {
				setDeleteError(error.message || "Failed to delete account");
			} else {
				setDeleteError("An unexpected error occurred");
			}
			setDeleting(false);
		}
	};

	const handleDeleteModalClose = () => {
		setShowDeleteModal(false);
		setDeleteConfirmPassword("");
		setDeleteError("");
	};

	if (loading) {
		return <FullPageLoader />;
	}

	return (
		<div className="min-h-screen bg-linear-to-br from-romance-50 via-white to-romance-100">
			<Header currentPath="/profile" userRole={profile?.role} />

			<PageContainer maxWidth="md">
				<div className="flex items-center gap-3 mb-8">
					<User className="w-8 h-8 text-romance-600" />
					<h1 className="text-4xl font-bold text-slate-900">
						Profile Settings
					</h1>
				</div>

				<ProfileInformation
					name={name}
					email={email}
					createdAt={profile?.createdAt}
					onNameChange={setName}
					onEmailChange={setEmail}
					onSubmit={handleUpdateProfile}
					isUpdating={profileUpdating}
					error={profileError}
					success={profileSuccess}
				/>

				<PasswordChange
					currentPassword={currentPassword}
					newPassword={newPassword}
					confirmPassword={confirmPassword}
					onCurrentPasswordChange={setCurrentPassword}
					onNewPasswordChange={setNewPassword}
					onConfirmPasswordChange={setConfirmPassword}
					onSubmit={handleChangePassword}
					isUpdating={passwordUpdating}
					error={passwordError}
					success={passwordSuccess}
				/>

				<PreferencesDisplay preferences={profile?.preferences} />

				<DangerZone onDeleteClick={() => setShowDeleteModal(true)} />
			</PageContainer>

			<DeleteAccountModal
				isOpen={showDeleteModal}
				password={deleteConfirmPassword}
				onPasswordChange={setDeleteConfirmPassword}
				onConfirm={handleDeleteAccount}
				onCancel={handleDeleteModalClose}
				isDeleting={deleting}
				error={deleteError}
			/>
		</div>
	);
}
