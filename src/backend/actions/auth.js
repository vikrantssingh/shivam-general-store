"use server";

import { createClient } from "@/backend/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { loginSchema, retailRegisterSchema, shopkeeperRegisterSchema } from "@/backend/validations/auth";

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

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
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
