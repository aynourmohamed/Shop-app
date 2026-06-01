CREATE TABLE "Orders" (
    "id" uuid DEFAULT gen_random_uuid(), 
    "userid" uuid DEFAULT gen_random_uuid(), 
    "items" text, 
    "total" numeric,
     "status" text, 
     "created_at" timestamp with time zone);



CREATE TABLE "Products" (
    "id" uuid DEFAULT gen_random_uuid(), 
    "name" text, 
    "description" text, 
    "price" numeric, 
    "image" text, 
    "category" text, 
    "barcode" numeric, 
    "imageurl" text, 
    "stock" integer DEFAULT 0);


CREATE TABLE "Store Location" (
    "id" uuid DEFAULT gen_random_uuid(), 
    "name" text, 
    "address" text, 
    "latitude" numeric, 
    "longitude" numeric);


CREATE TABLE "Wishlist" (
    "id" uuid DEFAULT gen_random_uuid(), 
    "userid" uuid DEFAULT gen_random_uuid(), 
    "productid" uuid DEFAULT gen_random_uuid());
