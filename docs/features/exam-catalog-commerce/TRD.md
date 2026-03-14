# TRD: Exam Catalog Commerce

- Feature ID: FT-003
- Slug: exam-catalog-commerce
- Status: In Progress
- Area: Commerce

## Data Model (Ringkas)

### `exam_products`
| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | PK |
| slug | VARCHAR | unique slug |
| title | VARCHAR | title exam |
| category | VARCHAR | category label |
| level | VARCHAR | BEGINNER / INTERMEDIATE / ADVANCED |
| price_amount | INTEGER | price in IDR |
| short_description | TEXT | card summary |
| is_published | BOOLEAN | visibility |

### `commerce_cart_items`
| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | PK |
| user_id | UUID | FK -> users.id |
| product_type | ENUM | EXAM / MENTORING_PACKAGE |
| product_id | UUID | related product |
| quantity | INTEGER | default 1 |

### `commerce_orders`
| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | PK |
| user_id | UUID | FK -> users.id |
| status | ENUM | PENDING_PAYMENT / PAID / FAILED / EXPIRED |
| total_amount | INTEGER | final amount |
| payment_provider | VARCHAR | provider name |
| payment_reference | VARCHAR | provider invoice id |

### `commerce_order_items`
| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | PK |
| order_id | UUID | FK -> commerce_orders.id |
| product_type | ENUM | EXAM / MENTORING_PACKAGE |
| product_id | UUID | related product |
| price_amount | INTEGER | snapshot price |

### `commerce_ownerships`
| Field | Type | Notes |
| --- | --- | --- |
| id | UUID | PK |
| user_id | UUID | FK -> users.id |
| product_type | ENUM | EXAM / MENTORING_PACKAGE |
| product_id | UUID | item owned user |
| order_id | UUID | source order |

## API Contract Overview

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | /catalog/exams | List exam products untuk publik |
| GET | /catalog/exams/:slug | Detail exam product |
| GET | /commerce/cart | Ambil cart aktif user |
| POST | /commerce/cart/items | Tambah item ke cart |
| DELETE | /commerce/cart/items/:id | Hapus item dari cart |
| POST | /commerce/checkout | Buat order pending payment |
| GET | /commerce/orders/:id | Ambil status order |
| POST | /commerce/payments/webhook/xendit | Callback payment provider |

## Task Breakdown

### Slicing + Contract
- [x] Halaman katalog ujian publik
- [x] Halaman detail ujian sebelum pembelian
- [x] Cart drawer/page dan checkout flow
- [x] API contract katalog, cart, order, payment webhook

### Backend
- [ ] Entity/repository cart, order, payment, ownership
- [ ] Use case add/remove cart, checkout, payment callback
- [ ] Rule duplicate purchase untuk exam dan mentoring package

### Integrasi FE
- [ ] Shared schema add-to-cart + checkout payload
- [ ] Shared response types catalog/cart/order/ownership
- [ ] Hooks frontend catalog, cart actions, checkout, order polling
- [ ] Wiring halaman slicing ke API hooks
