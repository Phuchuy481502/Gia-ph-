import { NextRequest } from "next/server";
import { createServiceRoleClient } from "@/utils/supabase/api";

interface AuthResult {
  valid: boolean;
  userId?: string;
  userRole?: string;
  error?: string;
}

/**
 * Verify JWT token from Authorization header
 * Supports: Bearer <token>
 */
export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
  try {
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        valid: false,
        error: "Missing or invalid Authorization header",
      };
    }

    const token = authHeader.substring(7);
    if (!token) {
      return {
        valid: false,
        error: "Empty bearer token",
      };
    }

    // Verify token with Supabase
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return {
        valid: false,
        error: "Invalid or expired token",
      };
    }

    // Fetch user role from profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, account_status")
      .eq("id", data.user.id)
      .single();

    // Check if account is suspended or deleted
    if (!profile || profile.account_status !== "active") {
      return {
        valid: false,
        error: "Account is not active",
      };
    }

    return {
      valid: true,
      userId: data.user.id,
      userRole: profile?.role || "member",
    };
  } catch (error) {
    console.error("Auth verification error:", error);
    return {
      valid: false,
      error: "Token verification failed",
    };
  }
}
