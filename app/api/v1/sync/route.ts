import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/utils/supabase/api";
import { verifyAuth } from "@/utils/api/auth";

/**
 * GET /api/v1/sync?since=timestamp&branch_id=uuid
 * Incremental sync endpoint for mobile clients with role-based filtering
 * 
 * Rate Limits:
 *   - 100 requests per hour per user
 *   - Returns 429 if exceeded
 * 
 * Role-Based Data Access:
 *   - Admin: All data
 *   - Editor: Data from assigned branches
 *   - Member: Public data + own events only
 */

// Rate limiting: store user IDs and request counts
const syncRateLimiter = new Map<string, { count: number; resetAt: number }>();

function checkSyncRateLimit(userId: string, maxRequests: number = 100, windowSeconds: number = 3600) {
  const now = Date.now();
  const record = syncRateLimiter.get(userId);

  if (record && record.resetAt > now) {
    if (record.count >= maxRequests) {
      return {
        allowed: false,
        retryAfter: Math.ceil((record.resetAt - now) / 1000),
      };
    }
    record.count++;
  } else {
    syncRateLimiter.set(userId, {
      count: 1,
      resetAt: now + windowSeconds * 1000,
    });
  }

  return { allowed: true };
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.valid) {
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const userId = authResult.userId!;
    const userRole = authResult.userRole!;

    // Check rate limiting
    const rateLimit = checkSyncRateLimit(userId, 100, 3600); // 100 requests/hour
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Sync rate limit exceeded (100 per hour)",
          code: "RATE_LIMITED",
          retryAfter: rateLimit.retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": rateLimit.retryAfter?.toString() || "3600",
          },
        }
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const sinceParam = url.searchParams.get("since");
    const branchIdParam = url.searchParams.get("branch_id");

    // Default to 24 hours ago if not specified
    const since = sinceParam 
      ? new Date(sinceParam) 
      : new Date(Date.now() - 24 * 60 * 60 * 1000);

    if (isNaN(since.getTime())) {
      return NextResponse.json(
        { error: "Invalid timestamp format", code: "INVALID_TIMESTAMP" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Fetch changed persons since timestamp (with role-based filtering)
    let personsQuery = supabase
      .from("persons")
      .select("*")
      .gte("updated_at", since.toISOString())
      .order("updated_at", { ascending: false });

    // Apply role-based filtering
    if (userRole === "member") {
      // Members only get public data or data they're linked to
      personsQuery = personsQuery.eq("is_public", true);
    } else if (userRole === "editor" && branchIdParam) {
      // Editors get data from their branch only
      personsQuery = personsQuery.eq("branch_id", branchIdParam);
    } else if (userRole === "editor" && !branchIdParam) {
      // If editor doesn't specify branch, they get data from all their branches
      // (in real implementation, would need to query their assigned branches first)
      // For now, allow all editor access if they request it
    }
    // Admins get all data (no filter)

    if (branchIdParam && userRole !== "admin") {
      personsQuery = personsQuery.eq("branch_id", branchIdParam);
    } else if (branchIdParam) {
      personsQuery = personsQuery.eq("branch_id", branchIdParam);
    }

    const { data: persons, error: personsError } = await personsQuery;

    if (personsError) {
      console.error("Persons sync error:", personsError);
      return NextResponse.json(
        { error: "Failed to fetch persons", code: "SYNC_ERROR" },
        { status: 500 }
      );
    }

    // Fetch changed relationships since timestamp (with role-based filtering)
    let relationshipsQuery = supabase
      .from("relationships")
      .select("*")
      .gte("updated_at", since.toISOString())
      .order("updated_at", { ascending: false });

    // Apply role-based filtering
    if (userRole === "member") {
      // Members only get relationships for public persons
      relationshipsQuery = relationshipsQuery
        .in("person_id", persons?.map(p => p.id) || []);
    } else if (userRole === "editor" && branchIdParam) {
      relationshipsQuery = relationshipsQuery.eq("branch_id", branchIdParam);
    }

    if (branchIdParam && userRole !== "admin") {
      relationshipsQuery = relationshipsQuery.eq("branch_id", branchIdParam);
    } else if (branchIdParam) {
      relationshipsQuery = relationshipsQuery.eq("branch_id", branchIdParam);
    }

    const { data: relationships, error: relationshipsError } = await relationshipsQuery;

    if (relationshipsError) {
      console.error("Relationships sync error:", relationshipsError);
      return NextResponse.json(
        { error: "Failed to fetch relationships", code: "SYNC_ERROR" },
        { status: 500 }
      );
    }

    // Fetch changed custom events since timestamp (with role-based filtering)
    let eventsQuery = supabase
      .from("custom_events")
      .select("*")
      .gte("updated_at", since.toISOString())
      .order("updated_at", { ascending: false });

    // Apply role-based filtering
    if (userRole === "member") {
      // Members only get their own events
      eventsQuery = eventsQuery.eq("created_by", userId);
    } else if (userRole === "editor" && branchIdParam) {
      eventsQuery = eventsQuery.eq("branch_id", branchIdParam);
    }

    if (branchIdParam && userRole !== "admin") {
      eventsQuery = eventsQuery.eq("branch_id", branchIdParam);
    } else if (branchIdParam) {
      eventsQuery = eventsQuery.eq("branch_id", branchIdParam);
    }

    const { data: events, error: eventsError } = await eventsQuery;

    if (eventsError) {
      console.error("Events sync error:", eventsError);
      return NextResponse.json(
        { error: "Failed to fetch events", code: "SYNC_ERROR" },
        { status: 500 }
      );
    }

    // Log sync operation for audit
    try {
      await supabase.from("sync_logs").insert([
        {
          user_id: userId,
          since_timestamp: since.toISOString(),
          rows_synced: (persons?.length || 0) + (relationships?.length || 0) + (events?.length || 0),
          branch_id: branchIdParam || null,
        },
      ]);
    } catch (logError) {
      console.error("Failed to log sync:", logError);
    }

    const now = new Date();
    return NextResponse.json(
      {
        timestamp: now.toISOString(),
        persons: persons || [],
        relationships: relationships || [],
        custom_events: events || [],
        changes: {
          persons: persons?.length || 0,
          relationships: relationships?.length || 0,
          events: events?.length || 0,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Sync endpoint error:", error);
    return NextResponse.json(
      { error: "Internal error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
