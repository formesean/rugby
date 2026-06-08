import { and, asc, count, eq, ilike, ne, or } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string | null;
  createdAt: Date;
};

export type UserTab = "users" | "admins";

export type GetUsersResult = {
  rows: UserRow[];
  total: number;
  pageCount: number;
};

const PAGE_SIZE = 10;

export async function getUsers({
  tab,
  page,
  search,
}: {
  tab: UserTab;
  page: number;
  search: string;
}): Promise<GetUsersResult> {
  const roleFilter = tab === "admins" ? eq(user.role, "admin") : ne(user.role, "admin");

  const searchFilter = search.trim()
    ? or(ilike(user.name, `%${search.trim()}%`), ilike(user.email, `%${search.trim()}%`))
    : undefined;

  const where = and(roleFilter, searchFilter);
  const offset = (page - 1) * PAGE_SIZE;

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(where)
      .orderBy(asc(user.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset),

    db.select({ total: count() }).from(user).where(where),
  ]);

  return { rows, total, pageCount: Math.ceil(total / PAGE_SIZE) };
}
