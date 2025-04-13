export const config = {
    stripe: {
      publishableKey: process.env.Publishable_key,
      secretKey: process.env.Secret_key,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      plans: {
        pro: {
          priceId: 'price_1PuXpcDKuwlnHiVMXvI1EFjJ'
        },

        free: {
          priceId: 'price_1PuFJaDKuwlnHiVMl0yBymah'
        }
      },
    },
  }