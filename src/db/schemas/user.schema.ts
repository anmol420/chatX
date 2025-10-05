import { boolean, index, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    username: varchar('username', { length:30 })
        .notNull()
        .unique(),
    email: varchar('email', { length: 255 })
        .notNull()
        .unique(),
    password: varchar('password', { length: 255 })
        .notNull(),
    isOnline: boolean('is_online')
        .default(false)
        .notNull(),
    otp: text('otp')
        .default('')
        .notNull(),
    isVerified: boolean('is_verified')
        .default(false)
        .notNull(),
    googleAuth: boolean('google_auth')
        .default(false)
        .notNull(),
    joinedRooms: text('joined_rooms').array()
        .default(sql`ARRAY[]::text[]`)
        .notNull(),
    lastSeen: timestamp('last_seen', { withTimezone: true})
        .default(sql`NOW()`)
        .notNull(),
    friendList: text('friend_list').array()
        .default(sql`ARRAY[]::text[]`)
        .notNull(),
    friendRequestSend: text('friend_req_send').array()
        .default(sql`ARRAY[]::text[]`)
        .notNull(),
    friendRequestRecieved: text('friend_req_recieved').array()
        .default(sql`ARRAY[]::text[]`)
        .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
        .default(sql`NOW()`)
        .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
        .default(sql`NOW()`)
        .notNull(),
}, (table) => [
    index('username_idx').on(table.username),
    index('email_idx').on(table.email),
]);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;