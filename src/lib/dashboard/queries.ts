import { and, count, countDistinct, desc, gte, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { authEvent, session, user } from "@/db/schema";

const ONLINE_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes
const nonAdmin = ne(user.role, "admin");
const nonAdminEvent = sql`(${user.role} IS NULL OR ${user.role} != 'admin')`;

const EVENTS_PAGE_SIZE = 10;

export type AuthEventRow = {
  id: string;
  eventType: "sign_in" | "sign_up" | "sign_out";
  email: string | null;
  userId: string | null;
  ipAddress: string | null;
  createdAt: Date;
  userName: string | null;
};

export async function getRecentEvents(page: number): Promise<{
  events: AuthEventRow[];
  total: number;
  pageCount: number;
}> {
  const offset = (page - 1) * EVENTS_PAGE_SIZE;

  const [events, [{ total }]] = await Promise.all([
    db
      .select({
        id: authEvent.id,
        eventType: authEvent.eventType,
        email: authEvent.email,
        userId: authEvent.userId,
        ipAddress: authEvent.ipAddress,
        createdAt: authEvent.createdAt,
        userName: user.name,
      })
      .from(authEvent)
      .leftJoin(user, sql`${authEvent.userId} = ${user.id}`)
      .where(nonAdminEvent)
      .orderBy(desc(authEvent.createdAt))
      .limit(EVENTS_PAGE_SIZE)
      .offset(offset),

    db
      .select({ total: count() })
      .from(authEvent)
      .leftJoin(user, sql`${authEvent.userId} = ${user.id}`)
      .where(nonAdminEvent),
  ]);

  return { events, total, pageCount: Math.ceil(total / EVENTS_PAGE_SIZE) };
}

export async function getDashboardStats() {
  const now = new Date();
  const onlineThreshold = new Date(now.getTime() - ONLINE_THRESHOLD_MS);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    [totalUsers],
    [newUsersToday],
    [activeSessions],
    [onlineUsers],
    topActiveUsers,
    dailyActiveUsers,
  ] = await Promise.all([
    // Total registered non-admin users
    db
      .select({ count: count() })
      .from(user)
      .where(nonAdmin),

    // New sign-ups today (non-admin)
    db
      .select({ count: count() })
      .from(user)
      .where(and(nonAdmin, gte(user.createdAt, todayStart))),

    // Active sessions for non-admin users
    db
      .select({ count: count() })
      .from(session)
      .innerJoin(user, sql`${session.userId} = ${user.id}`)
      .where(and(nonAdmin, gte(session.expiresAt, now))),

    // Online non-admin users (session updated in last 15 min)
    db
      .select({ count: countDistinct(session.userId) })
      .from(session)
      .innerJoin(user, sql`${session.userId} = ${user.id}`)
      .where(and(nonAdmin, gte(session.updatedAt, onlineThreshold), gte(session.expiresAt, now))),

    // Top 5 most recently active non-admin users
    db
      .select({
        userId: session.userId,
        name: user.name,
        email: user.email,
        lastSeen: sql<Date>`max(${session.updatedAt})`.as("last_seen"),
      })
      .from(session)
      .innerJoin(user, sql`${session.userId} = ${user.id}`)
      .where(and(nonAdmin, gte(session.expiresAt, now)))
      .groupBy(session.userId, user.name, user.email)
      .orderBy(desc(sql`max(${session.updatedAt})`))
      .limit(5),

    // Unique daily sign-ins (non-admin) for last 7 days
    db
      .select({
        date: sql<string>`date_trunc('day', ${authEvent.createdAt})::date::text`.as("date"),
        users: countDistinct(authEvent.userId),
      })
      .from(authEvent)
      .leftJoin(user, sql`${authEvent.userId} = ${user.id}`)
      .where(
        and(
          sql`${authEvent.eventType} = 'sign_in'`,
          sql`(${user.role} IS NULL OR ${user.role} != 'admin')`,
          gte(authEvent.createdAt, sevenDaysAgo),
        ),
      )
      .groupBy(sql`date_trunc('day', ${authEvent.createdAt})`)
      .orderBy(sql`date_trunc('day', ${authEvent.createdAt})`),
  ]);

  // Fill missing days with 0 so the chart always shows all 7 days
  const dataByDate = new Map(dailyActiveUsers.map((d) => [d.date, Number(d.users)]));
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    return { date: key, users: dataByDate.get(key) ?? 0 };
  });

  return {
    totalUsers: totalUsers.count,
    newUsersToday: newUsersToday.count,
    activeSessions: activeSessions.count,
    onlineUsers: onlineUsers.count,
    topActiveUsers,
    dailyActiveUsers: last7Days,
  };
}
