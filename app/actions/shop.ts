'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { plan, cartItem, order } from '@/lib/db/schema'
import { and, eq, desc } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

// Plan actions
export async function getPlans() {
  return db.select().from(plan).orderBy(desc(plan.createdAt))
}

export async function getPlanById(planId: string) {
  return db.select().from(plan).where(eq(plan.id, planId)).limit(1)
}

// Cart actions
export async function getCart() {
  const userId = await getUserId()
  return db
    .select()
    .from(cartItem)
    .where(eq(cartItem.userId, userId))
}

export async function addToCart(planId: string, quantity: number = 1) {
  const userId = await getUserId()
  
  const existingItem = await db
    .select()
    .from(cartItem)
    .where(and(eq(cartItem.userId, userId), eq(cartItem.planId, planId)))
    .limit(1)
  
  if (existingItem.length > 0) {
    await db
      .update(cartItem)
      .set({ quantity: existingItem[0].quantity + quantity })
      .where(eq(cartItem.id, existingItem[0].id))
  } else {
    await db.insert(cartItem).values({
      id: crypto.randomUUID(),
      userId,
      planId,
      quantity,
    })
  }
  
  revalidatePath('/cart')
}

export async function removeFromCart(itemId: string) {
  const userId = await getUserId()
  await db
    .delete(cartItem)
    .where(and(eq(cartItem.id, itemId), eq(cartItem.userId, userId)))
  
  revalidatePath('/cart')
}

export async function updateCartItem(itemId: string, quantity: number) {
  const userId = await getUserId()
  if (quantity <= 0) {
    await removeFromCart(itemId)
    return
  }
  
  await db
    .update(cartItem)
    .set({ quantity })
    .where(and(eq(cartItem.id, itemId), eq(cartItem.userId, userId)))
  
  revalidatePath('/cart')
}

export async function clearCart() {
  const userId = await getUserId()
  await db.delete(cartItem).where(eq(cartItem.userId, userId))
  revalidatePath('/cart')
}

// Order actions
export async function getOrders() {
  const userId = await getUserId()
  return db
    .select()
    .from(order)
    .where(eq(order.userId, userId))
    .orderBy(desc(order.createdAt))
}

export async function createOrder(items: any[], totalAmount: number) {
  const userId = await getUserId()
  const orderId = crypto.randomUUID()
  
  await db.insert(order).values({
    id: orderId,
    userId,
    totalAmount: totalAmount.toString(),
    status: 'pending',
    items: JSON.stringify(items),
  })
  
  return orderId
}

export async function updateOrderStatus(orderId: string, status: string) {
  const userId = await getUserId()
  await db
    .update(order)
    .set({ status })
    .where(and(eq(order.id, orderId), eq(order.userId, userId)))
  
  revalidatePath('/orders')
}
