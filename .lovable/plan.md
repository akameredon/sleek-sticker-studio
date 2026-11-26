# Rebuild Sleekblue Stickers cleanly in Lovable

## What I found
Your repo is a Replit project with a lot of clutter: 3 copies of the same AI helper code, a 50-file "mockup sandbox", an unused `modules/` folder (intent engine, state machine, etc.), ~20 AI-agent instruction docs, a separate Express server plus generated API clients, and two pages that do the same thing (Generate / DesignStudio, Track / OrderDetail).

The real product underneath is simple: a Nigerian custom-sticker store (prices in Naira) with a catalog, sizes/finishes/quantity pricing, a cart, Paystack checkout, WhatsApp order handoff, order tracking, customer accounts, reviews, an AI design helper and chat, and an admin page.

## What I'll build (one clean app)
1. **Storefront**: Home, Shop (with categories), Product page (size, finish, quantity, live price, reviews), Wishlist, Cart.
2. **Checkout**: delivery details, then pay with **Paystack** (your existing account is kept) or send the order on **WhatsApp**. Payment is confirmed on the server, so prices can't be changed by customers.
3. **Orders**: Track by order reference, payment return page, and "My orders" in the account.
4. **Accounts**: sign up / log in with email.
5. **Artwork upload**: customers attach their design files to an order (files kept private).
6. **AI**: design studio that generates sticker mockups from a prompt, plus a floating chat assistant that answers questions and suggests products. Runs on built-in AI, so no OpenAI key needed.
7. **Admin** (owner only): manage orders and statuses, products, reviews and shop settings (WhatsApp number, hours, delivery note).
8. A fresh, consistent design using your Sleekblue brand colors and logo.

## Left out for now (tell me if you need any)
- Voice assistant (talking to the store)
- Bulk "batch" generator and the production-artwork tool
- WhatsApp Cloud bot automation (the WhatsApp order button stays)

## Your data
Your old database lives on Neon. After the preview, I'll ask for CSV exports of your products, orders and customers so nothing is lost. Existing customers will confirm their email and choose a new password on their first visit.

## Technical details
- TanStack Start routes replace wouter; Lovable Cloud (Postgres + auth + storage) replaces Neon, Express, Drizzle and GCS.
- Tables: categories, products, orders, payments, reviews, shop_settings, profiles, user_roles (admin via role table + has_role()).
- Paystack: server function initializes the transaction with server-computed totals; `/api/public/paystack-webhook` verifies HMAC-SHA512 and marks orders paid. Needs `PAYSTACK_SECRET_KEY` (asked securely at verification time).
- Pricing logic ported from `pricing.ts` into a shared module with unit tests.
- AI via Lovable AI Gateway (chat streaming + image generation).
