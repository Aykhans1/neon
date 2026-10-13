"use server";

import { sql } from "../lib/db";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
}

// 1. İstifadəçi Qeydiyyatı (Register)
export async function registerUser(formData: FormData): Promise<AuthResponse> {
  try {
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!fullName || !email || !password) {
      return { success: false, message: "Bütün xanaları doldurun." };
    }

    // Email-in mövcudluğunu yoxlayırıq
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email.toLowerCase().trim()} LIMIT 1
    `;

    if (existingUser.length > 0) {
      return { success: false, message: "Bu email ünvanı ilə artıq qeydiyyat keçilib." };
    }

    // Parolu Kriptoqrafik Hash edirik (Salt round: 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    // İstifadəçini bazaya əlavə edirik
    const newUser = await sql`
      INSERT INTO users (full_name, email, password_hash, role)
      VALUES (${fullName.trim()}, ${email.toLowerCase().trim()}, ${hashedPassword}, 'customer')
      RETURNING id, full_name, email, role
    `;

    const user = newUser[0];

    // Session Cookie təyin edirik
    const cookieStore = await cookies();
    cookieStore.set("user_session", JSON.stringify({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 gün
      path: "/"
    });

    return {
      success: true,
      message: "Qeydiyyat uğurla tamamlandı!",
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
      },
    };
  } catch (error) {
    console.error("Qeydiyyat xətası:", error);
    return { success: false, message: "Qeydiyyat zamanı xəta baş verdi." };
  }
}

// 2. İstifadəçi Girişi (Login)
export async function loginUser(formData: FormData): Promise<AuthResponse> {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return { success: false, message: "Email və şifrəni daxil edin." };
    }

    // İstifadəçini tapırıq
    const users = await sql`
      SELECT id, full_name, email, password_hash, role
      FROM users
      WHERE email = ${email.toLowerCase().trim()}
      LIMIT 1
    `;

    if (users.length === 0) {
      return { success: false, message: "İstifadəçi tapılmadı və ya şifrə yanlışdır." };
    }

    const user = users[0];

    // Hash olunmuş şifrəni yoxlayırıq
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return { success: false, message: "İstifadəçi tapılmadı və ya şifrə yanlışdır." };
    }

    // Session Cookie təyin edirik
    const cookieStore = await cookies();
    cookieStore.set("user_session", JSON.stringify({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/"
    });

    return {
      success: true,
      message: "Uğurla daxil oldunuz!",
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
      },
    };
  } catch (error) {
    console.error("Giriş xətası:", error);
    return { success: false, message: "Giriş zamanı xəta baş verdi." };
  }
}

// 3. Aktiv istifadəçi sesiyasını çəkən funksiya
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("user_session")?.value;
    if (!session) return null;
    return JSON.parse(session);
  } catch {
    return null;
  }
}

// 4. Çıxış (Logout)
export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("user_session");
  return { success: true };
}