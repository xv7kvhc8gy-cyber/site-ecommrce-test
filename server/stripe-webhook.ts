import express from "express";
import Stripe from "stripe";
import { ENV } from "./_core/env";
import * as db from "./db";
import { nanoid } from "nanoid";

const stripe = new Stripe(ENV.stripeSecretKey, {
  apiVersion: "2025-11-17.clover",
});

export function registerStripeWebhook(app: express.Application) {
  // CRITICAL: Register webhook BEFORE express.json() middleware
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      const sig = req.headers["stripe-signature"];

      if (!sig) {
        console.error("[Webhook] Missing stripe-signature header");
        return res.status(400).send("Missing signature");
      }

      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          ENV.stripeWebhookSecret
        );
      } catch (err: any) {
        console.error("[Webhook] Signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      console.log(`[Webhook] Received event: ${event.type} (${event.id})`);

      // CRITICAL: Handle test events
      if (event.id.startsWith("evt_test_")) {
        console.log("[Webhook] Test event detected, returning verification response");
        return res.json({
          verified: true,
        });
      }

      try {
        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            await handleCheckoutCompleted(session);
            break;
          }

          case "payment_intent.succeeded": {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            console.log(`[Webhook] Payment succeeded: ${paymentIntent.id}`);
            break;
          }

          case "payment_intent.payment_failed": {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            console.log(`[Webhook] Payment failed: ${paymentIntent.id}`);
            break;
          }

          default:
            console.log(`[Webhook] Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
      } catch (error) {
        console.error("[Webhook] Error processing event:", error);
        res.status(500).json({ error: "Webhook processing failed" });
      }
    }
  );
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log(`[Webhook] Processing checkout.session.completed: ${session.id}`);

  const userId = session.metadata?.user_id;
  const customerEmail = session.metadata?.customer_email;

  if (!userId) {
    console.error("[Webhook] Missing user_id in session metadata");
    return;
  }

  try {
    // Récupérer les items de la session
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ["data.price.product"],
    });

    // Récupérer les items du panier de l'utilisateur
    const cartItems = await db.getCartItems(Number(userId));

    if (cartItems.length === 0) {
      console.error("[Webhook] No cart items found for user");
      return;
    }

    // Créer la commande
    const orderNumber = `ORD-${nanoid(10).toUpperCase()}`;
    const totalAmount = session.amount_total || 0;

    // Récupérer ou créer l'adresse de livraison
    let shippingAddressId: number | undefined;
    const shippingDetails = (session as any).shipping_details;
    
    if (shippingDetails?.address) {
      const addresses = await db.getUserAddresses(Number(userId));
      
      // Chercher une adresse existante similaire
      const existingAddress = addresses.find(
        (addr) =>
          addr.addressLine1 === shippingDetails.address?.line1 &&
          addr.postalCode === shippingDetails.address?.postal_code
      );

      if (existingAddress) {
        shippingAddressId = existingAddress.id;
      } else {
        // Créer une nouvelle adresse
        await db.createAddress({
          userId: Number(userId),
          fullName: shippingDetails.name || customerEmail || "Client",
          addressLine1: shippingDetails.address.line1 || "",
          addressLine2: shippingDetails.address.line2 || undefined,
          city: shippingDetails.address.city || "",
          postalCode: shippingDetails.address.postal_code || "",
          country: shippingDetails.address.country || "FR",
          phone: shippingDetails.phone || undefined,
          isDefault: false,
        });

        // Récupérer l'ID de la nouvelle adresse
        const newAddresses = await db.getUserAddresses(Number(userId));
        shippingAddressId = newAddresses[0]?.id;
      }
    }

    // Préparer les items de la commande (sans orderId, il sera ajouté par createOrder)
    const orderItems = cartItems.map((item) => ({
      orderId: 0, // Placeholder, sera remplacé par createOrder
      productId: item.product!.id,
      productName: item.product!.name,
      productImage: (() => {
        try {
          const images = JSON.parse(item.product!.images);
          return images[0] || null;
        } catch {
          return null;
        }
      })(),
      quantity: item.cartItem.quantity,
      priceAtPurchase: item.product!.price,
    }));

    // Créer la commande dans la base de données
    await db.createOrder(
      {
        userId: Number(userId),
        orderNumber,
        status: "processing",
        totalAmount,
        shippingAddressId,
        stripePaymentIntentId: session.payment_intent as string,
      },
      orderItems
    );

    // Vider le panier
    await db.clearCart(Number(userId));

    console.log(`[Webhook] Order created successfully: ${orderNumber}`);
  } catch (error) {
    console.error("[Webhook] Error creating order:", error);
    throw error;
  }
}
