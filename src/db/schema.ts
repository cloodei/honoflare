import { sql } from "drizzle-orm";
import { date, pgTable, primaryKey, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("USERS", {
  id: serial("id").primaryKey().notNull(),
  name: varchar({ length: 128 }).notNull(),
  email: varchar({ length: 128 }).notNull(),
  password: varchar({ length: 512 }).notNull(),
  trang_thai: varchar({ enum: ["active", "inactive"] }).notNull().default("active"),
  created_at: timestamp({ mode: "string" }).notNull().default(sql`LOCALTIMESTAMP`),
  updated_at: timestamp({ mode: "string" }).notNull().default(sql`LOCALTIMESTAMP`),
})

export const booksTable = pgTable("BOOKS", {
  id: serial("id").primaryKey().notNull(),
  title: varchar({ length: 128 }).notNull(),
  author: varchar({ length: 128 }).notNull(),
  content: text(),
  category: varchar({ length: 128 }).notNull(),
  publish_date: date({ mode: "string" }).notNull(),
})

export const borrowTable = pgTable("BORROW", {
  user_id: serial("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  book_id: serial("book_id").notNull().references(() => booksTable.id, { onDelete: "cascade" }),
  borrow_date: date({ mode: "string" }).notNull(),
}, table => [
  primaryKey({ columns: [table.user_id, table.book_id] })
])
