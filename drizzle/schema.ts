import { pgTable, serial, varchar, text, date, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const books = pgTable("BOOKS", {
	id: serial().primaryKey().notNull(),
	title: varchar({ length: 128 }).notNull(),
	author: varchar({ length: 128 }).notNull(),
	content: text(),
	category: varchar({ length: 128 }).notNull(),
	publishDate: date("publish_date").notNull(),
});

export const borrow = pgTable("BORROW", {
	userId: serial("user_id").notNull(),
	bookId: serial("book_id").notNull(),
	borrowDate: date("borrow_date").notNull(),
});

export const users = pgTable("USERS", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 128 }).notNull(),
	email: varchar({ length: 128 }).notNull(),
	password: varchar({ length: 512 }).notNull(),
	trangThai: varchar("trang_thai").default('active').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`LOCALTIMESTAMP`).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`LOCALTIMESTAMP`).notNull(),
});

export const tenants = pgTable("tenants", {
	id: uuid().default(sql`public.uuid_generate_v7()`).notNull(),
	name: text(),
	created: timestamp({ mode: 'string' }).default(sql`LOCALTIMESTAMP`).notNull(),
	updated: timestamp({ mode: 'string' }).default(sql`LOCALTIMESTAMP`).notNull(),
	deleted: timestamp({ mode: 'string' }),
	computeId: uuid("compute_id"),
}, (table) => [
	uniqueIndex("tenants_pkey").using("btree", table.id.asc().nullsLast().op("uuid_ops")),
]);
