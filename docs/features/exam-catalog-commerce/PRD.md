# PRD: Exam Catalog Commerce

- Feature ID: FT-003
- Slug: exam-catalog-commerce
- Status: In Progress
- Area: Commerce

## Problem Statement

User belum punya alur pembelian ujian yang jelas dari katalog sampai checkout.
Creator juga belum punya jaminan entitlement otomatis setelah pembayaran sukses.

## Goals

- Menyediakan halaman katalog ujian publik.
- Menyediakan halaman detail ujian sebelum pembelian.
- Menyediakan cart + checkout flow untuk pembelian ujian.
- Menjamin status order sinkron dengan callback payment.

## Non-Goals

- Tidak membangun dashboard analytics penjualan.
- Tidak membangun refund workflow.
- Tidak membangun gateway payment kedua selain provider default yang terhubung.

## Personas

- Visitor/User: mencari ujian dan melakukan pembelian.
- Creator/Admin: memonitor status pembayaran dan ownership.

## User Stories

1. Sebagai user, saya bisa melihat daftar ujian yang bisa dibeli.
2. Sebagai user, saya bisa membuka detail ujian untuk memahami konten sebelum checkout.
3. Sebagai user, saya bisa menambahkan ujian ke cart, lalu checkout.
4. Sebagai sistem, saya harus menolak pembelian duplicate untuk item yang sudah dimiliki.

## Functional Requirements

1. Katalog menampilkan list exam cards: title, category, level, price, short description.
2. Detail exam menampilkan outline, benefit, dan CTA add-to-cart/checkout.
3. Cart menampilkan item, subtotal, dan aksi remove item.
4. Checkout membuat order pending payment dan menampilkan instruksi pembayaran.
5. Callback payment mengubah status order (`PAID` / `FAILED`) dan ownership.
6. API harus menyediakan endpoint katalog, cart, checkout, status order, dan webhook payment.

## Success Metrics

- Conversion dari detail page ke checkout.
- Rasio payment success vs failed.
- Error rate endpoint checkout/payment callback.

## Acceptance Criteria

1. Halaman katalog, detail, dan checkout tersedia di web.
2. API contract untuk katalog/cart/order/payment terdokumentasi.
3. Duplicate purchase dicegah oleh backend (ujian dan mentoring package).
4. Ownership ter-update otomatis setelah payment success.
