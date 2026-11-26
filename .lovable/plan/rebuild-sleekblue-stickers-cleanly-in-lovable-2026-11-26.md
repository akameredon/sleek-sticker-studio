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

Decisively deal with it what I want is what a client can use. A customer can use to make the journey very simple and very easy. They are able to generate their designs for their stickers for their labs on their own knowing the sizes and everything that's the solution they have to understand your size solution because this will help them know all those things I need to be fantastic so they will just send it to us and print that is our job so that's the solution. Customer uses this platform to make their designs and then send the output to us after they have made payment so that we can print and cost for them. It's a very simple proposal. I don't want you to be complicated. Make it very simple just use a few minutes to resolve everything to build everything. They use an interface and use a experience to be top-notch delete anything that is not necessary. I repeat delete anything that is not necessary.All we want is we reach out to potential customers we send them this platform they use this platform to generate their designs and send it to us. We print our quote for them. All we want is money making money. You have to have speed so we want this app to have speed. We don't want it to have unnecessary things that are not needed everything there is no necessary. Delete it just keep the necessary ones. Keep the necessary ones we want we want a situation. The customer will just spend only one minute on our platform and then they get the solution they want and we deliver in record times speed speed is the king speed is what we want speed this morning before us are doing it under two minutes. We do it under 30 seconds. That is the magic we want to perform  perform magic speed. 