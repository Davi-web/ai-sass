import {auth} from "@clerk/nextjs"
import { stripe } from "@/lib/stripe"
import prismadb from "@/lib/prismadb"
const DAY_IN_MS = 86_400_000;

export const checkSubscription = async() => {
    const {userId} = auth();
    if (!userId) {
        return false
    }
    const userSubscription = await prismadb.userSubscription.findUnique({
       where: {
        userId
       },
       select: {
        stripeSubscriptonId: true,
        stripeCurrentPeriodEnd: true,
        stripeCustomerId: true,
        stripePriceId: true,
       }
    })

    if(!userSubscription) return false

    const isValid = userSubscription.stripePriceId && userSubscription.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now();
    if(!!isValid) {
        return true
    } else{
        // If the subscription is not valid, check if the user has a valid subscription in Stripe
        if(userSubscription.stripeSubscriptonId) {
            const stripeSubscription = await stripe.subscriptions.retrieve(userSubscription.stripeSubscriptonId, {
                expand:["latest_invoice", "plan"]
            }, {
                maxNetworkRetries: 3
            })
            if(stripeSubscription.status === "active") {
                await prismadb.userSubscription.update({
                    where: {
                        userId
                    },
                    data: {
                        stripeCurrentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
                    }
                })
                return true
            } else {
                // If the subscription is not active in Stripe, remove the subscription from the database
                await prismadb.userSubscription.update({
                    where: {
                        userId
                    },
                    data: {
                        stripeSubscriptonId: null,
                        stripeCurrentPeriodEnd: null,
                    }
                })
                return false
            }
        }
    }

    return false
}