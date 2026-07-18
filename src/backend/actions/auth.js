"use server";

import { createClient } from "@/backend/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { loginSchema, retailRegisterSchema, shopkeeperRegisterSchema, forgotPasswordSchema, resetPasswordSchema } from "@/backend/validations/auth";

export async function loginAction(formData) {
  const supabase = createClient();

  const validatedFields = loginSchema.safeParse({
    email: formData.email,
    password: formData.password,
  });

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  const { email, password } = validatedFields.data;

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Fetch the user's role to determine redirect destination
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  revalidatePath("/", "layout");
  
  if (profile && profile.role === "admin") {
    redirect("/admin");
  } else {
    redirect("/");
  }
}

export async function registerRetailAction(formData) {
  const supabase = createClient();

  const validatedFields = retailRegisterSchema.safeParse(formData);

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  const { email, password, fullName } = validatedFields.data;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: "retail",
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function registerShopkeeperAction(formData) {
  const supabase = createClient();

  const validatedFields = shopkeeperRegisterSchema.safeParse(formData);

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  const { email, password, fullName, phone, businessName, businessAddress, gstNumber } = validatedFields.data;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: "shopkeeper_pending",
        phone,
        business_name: businessName,
        business_address: businessAddress,
        gst_number: gstNumber,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Usually redirect to a pending approval page
  revalidatePath("/", "layout");
  redirect("/pending-approval");
}

export async function logoutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function forgotPasswordAction(formData) {
  const supabase = createClient();
  const validatedFields = forgotPasswordSchema.safeParse(formData);
  
  if (!validatedFields.success) return { error: "Invalid email" };

  const { error } = await supabase.auth.resetPasswordForEmail(validatedFields.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function resetPasswordAction(formData, code) {
  const supabase = createClient();
  const validatedFields = resetPasswordSchema.safeParse(formData);
  
  if (!validatedFields.success) return { error: "Invalid passwords" };

  // If a code is provided in the URL, exchange it for a session first
  if (code) {
    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
    if (sessionError) return { error: "Invalid or expired reset link. Please request a new one." };
  }

  // Update the user's password
  const { error } = await supabase.auth.updateUser({
    password: validatedFields.data.password
  });

  if (error) return { error: error.message };
  
  return { success: true };
}

export async function updateProfileAction(formData) {
  const supabase = createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  const fullName = formData.get("fullName");
  const phone = formData.get("phone");
  const address = formData.get("address");
  const avatarFile = formData.get("avatar");

  let avatar_url = undefined;

  if (avatarFile && avatarFile.size > 0) {
    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, avatarFile, { upsert: true });
      
    if (uploadError) {
      console.error("Avatar upload error:", uploadError);
      return { error: "Failed to upload avatar: " + uploadError.message };
    }
    
    if (uploadData) {
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(fileName);
      avatar_url = publicUrl;
    }
  }

  const updates = {
    full_name: fullName,
    phone: phone,
    business_address: address, // Map generic address to business_address if that's what's in schema
  };

  if (avatar_url !== undefined) {
    updates.avatar_url = avatar_url;
  }

  const { error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/account");
  return { success: true };
}

