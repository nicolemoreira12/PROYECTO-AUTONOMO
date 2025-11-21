import { PubSub } from "graphql-subscriptions";

// Instancia global de PubSub usada por GraphQL para subscriptions
export const pubsub = new PubSub();

export const PRODUCT_ADDED = "PRODUCT_ADDED";
export const ORDER_CREATED = "ORDER_CREATED";
