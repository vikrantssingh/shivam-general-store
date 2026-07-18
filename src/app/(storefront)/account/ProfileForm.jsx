"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateProfileAction } from "@/backend/actions/auth";
import { toast } from "sonner";
import { Loader2, Edit2, X } from "lucide-react";

export function ProfileForm({ profile, userEmail }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData) {
    setIsPending(true);
    try {
      const result = await updateProfileAction(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Profile updated successfully!");
        setIsEditing(false);
      }
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  if (!isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Profile Details</h2>
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-xl">
            <span className="text-xs text-gray-500 block mb-1">Email</span>
            <span className="font-medium text-gray-900">{userEmail}</span>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl">
            <span className="text-xs text-gray-500 block mb-1">Full Name</span>
            <span className="font-medium text-gray-900">{profile?.full_name || "Not provided"}</span>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl">
            <span className="text-xs text-gray-500 block mb-1">Phone Number</span>
            <span className="font-medium text-gray-900">{profile?.phone || "Not provided"}</span>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl">
            <span className="text-xs text-gray-500 block mb-1">Address</span>
            <span className="font-medium text-gray-900">{profile?.business_address || "Not provided"}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Edit Profile</h2>
        <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
      <form action={handleSubmit} className="space-y-4 bg-gray-50 p-6 rounded-xl border border-gray-100">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-gray-700">Profile Photo</label>
            <Input type="file" name="avatar" accept="image/*" className="bg-white" />
            <p className="text-[0.8rem] text-gray-500">Upload a new photo to change your avatar.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700">
                Email
              </label>
              <Input 
                type="email" 
                name="email"
                defaultValue={userEmail} 
                disabled 
                className="bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700">
                Full Name
              </label>
              <Input 
                type="text" 
                name="fullName"
                defaultValue={profile?.full_name || ""} 
                placeholder="Your full name"
                required
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700">
                Phone Number
              </label>
              <Input 
                type="tel" 
                name="phone"
                defaultValue={profile?.phone || ""} 
                placeholder="Your phone number"
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700">
                Address
              </label>
              <Input 
                type="text" 
                name="address"
                defaultValue={profile?.business_address || ""} 
                placeholder="Your address"
                className="bg-white"
              />
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200 flex justify-end">
          <Button type="submit" disabled={isPending} className="bg-green-700 hover:bg-green-800 text-white font-semibold">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
