import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import Stripe from "stripe";
import { ENV } from "./_core/env";

const stripe = new Stripe(ENV.stripeSecretKey, {
  apiVersion: "2025-11-17.clover",
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Categories
  categories: router({
    list: publicProcedure.query(async () => {
      return await db.getAllCategories();
    }),
  }),

  // Products
  products: router({
    list: publicProcedure
      .input(z.object({
        categoryId: z.number().optional(),
        featured: z.boolean().optional(),
        isNew: z.boolean().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getAllProducts(input);
      }),
    
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return await db.getProductBySlug(input.slug);
      }),
  }),

  // Reviews
  reviews: router({
    list: publicProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => {
        return await db.getProductReviews(input.productId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        productId: z.number(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createReview({
          ...input,
          userId: ctx.user.id,
        });
        return { success: true };
      }),
  }),

  // Cart
  cart: router({
    getItems: protectedProcedure.query(async ({ ctx }) => {
      return await db.getCartItems(ctx.user.id);
    }),
    
    addItem: protectedProcedure
      .input(z.object({
        productId: z.number(),
        quantity: z.number().min(1).default(1),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.addToCart({
          userId: ctx.user.id,
          productId: input.productId,
          quantity: input.quantity,
        });
        return { success: true };
      }),
    
    updateQuantity: protectedProcedure
      .input(z.object({
        cartItemId: z.number(),
        quantity: z.number().min(0),
      }))
      .mutation(async ({ input }) => {
        await db.updateCartItemQuantity(input.cartItemId, input.quantity);
        return { success: true };
      }),
    
    removeItem: protectedProcedure
      .input(z.object({ cartItemId: z.number() }))
      .mutation(async ({ input }) => {
        await db.removeFromCart(input.cartItemId);
        return { success: true };
      }),
    
    clear: protectedProcedure.mutation(async ({ ctx }) => {
      await db.clearCart(ctx.user.id);
      return { success: true };
    }),
  }),

  // Addresses
  addresses: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserAddresses(ctx.user.id);
    }),
    
    create: protectedProcedure
      .input(z.object({
        fullName: z.string(),
        addressLine1: z.string(),
        addressLine2: z.string().optional(),
        city: z.string(),
        postalCode: z.string(),
        country: z.string(),
        phone: z.string().optional(),
        isDefault: z.boolean().default(false),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createAddress({
          ...input,
          userId: ctx.user.id,
        });
        return { success: true };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        fullName: z.string().optional(),
        addressLine1: z.string().optional(),
        addressLine2: z.string().optional(),
        city: z.string().optional(),
        postalCode: z.string().optional(),
        country: z.string().optional(),
        phone: z.string().optional(),
        isDefault: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        await db.updateAddress(id, { ...data, userId: ctx.user.id });
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteAddress(input.id);
        return { success: true };
      }),
  }),

  // Orders
  orders: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserOrders(ctx.user.id);
    }),
    
    getById: protectedProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ input }) => {
        const order = await db.getOrderById(input.orderId);
        if (!order) return null;
        const items = await db.getOrderItems(input.orderId);
        return { order, items };
      }),
  }),

  // Stripe Checkout
  stripe: router({
    createCheckoutSession: protectedProcedure
      .input(z.object({
        addressId: z.number().optional(),
        newAddress: z.object({
          fullName: z.string(),
          addressLine1: z.string(),
          addressLine2: z.string().optional(),
          city: z.string(),
          postalCode: z.string(),
          country: z.string(),
          phone: z.string().optional(),
        }).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Récupérer les items du panier
        const cartItems = await db.getCartItems(ctx.user.id);
        
        if (cartItems.length === 0) {
          throw new Error("Le panier est vide");
        }

        // Préparer les line items pour Stripe
        const lineItems = cartItems.map((item) => ({
          price_data: {
            currency: "eur",
            product_data: {
              name: item.product!.name,
              description: item.product!.description || undefined,
              images: (() => {
                try {
                  const images = JSON.parse(item.product!.images);
                  return images.slice(0, 1); // Stripe accepte max 8 images
                } catch {
                  return [];
                }
              })(),
            },
            unit_amount: item.product!.price,
          },
          quantity: item.cartItem.quantity,
        }));

        // Récupérer l'adresse de livraison
        let shippingAddress;
        if (input.addressId) {
          const addresses = await db.getUserAddresses(ctx.user.id);
          shippingAddress = addresses.find((addr) => addr.id === input.addressId);
        } else if (input.newAddress) {
          shippingAddress = input.newAddress;
        }

        // Créer la session Stripe Checkout
        const origin = ctx.req.headers.origin || "http://localhost:3000";
        
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: lineItems,
          mode: "payment",
          success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/checkout`,
          customer_email: ctx.user.email || undefined,
          client_reference_id: ctx.user.id.toString(),
          metadata: {
            user_id: ctx.user.id.toString(),
            customer_email: ctx.user.email || "",
            customer_name: ctx.user.name || "",
          },
          allow_promotion_codes: true,
          shipping_address_collection: shippingAddress ? undefined : {
            allowed_countries: ["FR", "BE", "CH", "LU", "MC"],
          },
          ...(shippingAddress && {
            shipping_options: [
              {
                shipping_rate_data: {
                  type: "fixed_amount",
                  fixed_amount: {
                    amount: 0,
                    currency: "eur",
                  },
                  display_name: "Livraison gratuite",
                },
              },
            ],
          }),
        });

        return { url: session.url };
      }),
  }),
});

export type AppRouter = typeof appRouter;
