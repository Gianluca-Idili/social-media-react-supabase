import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey",
};

async function sendNotification(
  userId: string,
  title: string,
  body: string,
  tag: string
) {
  try {
    const { data: subscriptions } = await supabase
      .from("push_subscriptions")
      .select("subscription")
      .eq("user_id", userId);

    if (!subscriptions || subscriptions.length === 0) {
      console.log(`No subscriptions found for user ${userId}`);
      return;
    }

    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
    if (!vapidPrivateKey) {
      console.error("VAPID_PRIVATE_KEY not configured");
      return;
    }

    const payload = JSON.stringify({
      title,
      body,
      tag,
      timestamp: new Date().toISOString(),
    });

    const promises = subscriptions.map((sub) =>
      fetch("https://fcm.googleapis.com/fcm/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `key=${Deno.env.get("FCM_SERVER_KEY")}`,
        },
        body: JSON.stringify({
          to: (sub.subscription as any).endpoint,
          notification: { title, body, tag },
          data: { tag, timestamp: new Date().toISOString() },
        }),
      })
    );

    await Promise.all(promises);
    console.log(`Notification sent to user ${userId}`);
  } catch (error) {
    console.error(`Error sending notification to user ${userId}:`, error);
  }
}

async function checkExpiredLists() {
  console.log("Starting check for expired lists...");

  const now = new Date();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

  try {
    // Fetch all lists that should have notifications
    const { data: listsToNotify, error } = await supabase
      .from("lists")
      .select("id, user_id, title, created_at, expires_at, is_completed")
      .eq("notification_sent", false)
      .or(
        `and(expires_at.lt.${now.toISOString()},is_completed.eq.false),and(created_at.gt.${twoHoursAgo.toISOString()},created_at.lt.${now.toISOString()})`
      );

    if (error) {
      console.error("Error fetching lists:", error);
      return;
    }

    console.log(`Found ${listsToNotify?.length || 0} lists to process`);

    if (!listsToNotify || listsToNotify.length === 0) {
      return;
    }

    // Process each list
    for (const list of listsToNotify) {
      const expiresAt = list.expires_at ? new Date(list.expires_at) : null;
      const createdAt = new Date(list.created_at);

      // Check if list has expired
      if (expiresAt && expiresAt < now && !list.is_completed) {
        await sendNotification(
          list.user_id,
          "⏰ Lista Scaduta",
          `La lista "${list.title}" è scaduta`,
          "list_expired"
        );

        // Mark notification as sent
        await supabase
          .from("lists")
          .update({ notification_sent: true })
          .eq("id", list.id);

        console.log(`Sent expired notification for list ${list.id}`);
      }

      // Check if list was created 5 minutes ago
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      if (createdAt > fiveMinutesAgo && createdAt < now) {
        await sendNotification(
          list.user_id,
          "✨ Nuova Lista Creata",
          `Hai creato la lista "${list.title}" 5 minuti fa. Come sta procedendo?`,
          "list_5min_reminder"
        );

        console.log(`Sent 5-minute reminder for list ${list.id}`);
      }

      // Check if list expires within 6 hours
      if (expiresAt) {
        const sixHoursFromNow = new Date(now.getTime() + 6 * 60 * 60 * 1000);
        if (expiresAt > now && expiresAt < sixHoursFromNow && !list.is_completed) {
          const hoursLeft = Math.ceil(
            (expiresAt.getTime() - now.getTime()) / (60 * 60 * 1000)
          );
          await sendNotification(
            list.user_id,
            "⏳ Lista in Scadenza",
            `La lista "${list.title}" scade tra ${hoursLeft} ore!`,
            "list_expiring"
          );

          await supabase
            .from("lists")
            .update({ notification_sent: true })
            .eq("id", list.id);

          console.log(`Sent expiring notification for list ${list.id}`);
        }
      }
    }
  } catch (error) {
    console.error("Error checking expired lists:", error);
  }
}

Deno.serve(async (req) => {
  // Allow CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Check if this is being called as a scheduled function
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await checkExpiredLists();

    return new Response(
      JSON.stringify({ message: "List check completed successfully" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
